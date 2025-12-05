import { VerifiedIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/primitives/dialog";
import Input from "@/components/primitives/input";
import type { ApiSubmitResponse, Field, FormSchema } from "@/generated/types";
import { getTauRPC } from "@/lib/taurpc/useTaurpc";

type ApikeyModalProps = {
  schema: FormSchema;
  open?: boolean;
  onOpenChange?: (val: boolean) => void;
  onComplete?: () => Promise<void> | void;
  onCancel?: () => void;
  initialValues?: Record<string, string>;
  submitting?: boolean;
};

type FieldError = {
  id: string;
  message: string;
};

type formState = {
  values: Record<string, string>;
  touched: Record<string, boolean>;
};

const validate = (fields: Field[], vals: Record<string, string>) => {
  const errors: FieldError[] = [];

  fields.forEach((field) => {
    const val = vals[field.id]?.trim() ?? "";

    if (!val) {
      errors.push({
        id: field.id,
        message: `${field.label} is required.`,
      });
      return;
    }

    if (field.regex) {
      try {
        const regex = new RegExp(field.regex);
        if (!regex.test(val)) {
          errors.push({
            id: field.id,
            message: `Invalid format for ${field.label}.`,
          });
        }
      } catch (e) {
        console.error("[Provider error] Invalid Regex:", e);
        toast.error("Provider returned invalid validation regex.");
      }
    }
  });

  return errors;
};

export default function ApikeyModal({
  schema,
  onCancel,
  onOpenChange,
  onComplete,
  submitting = false,
  open: openIntent,
  initialValues: initalValues,
}: ApikeyModalProps) {
  const [_open, _setOpen] = useState(openIntent ?? false);
  const [formState, setFormState] = useState<formState>(() => {
    const initialValues = schema.fields.reduce(
      (acc, field) => {
        acc[field.id] = initalValues?.[field.id] ?? "";
        return acc;
      },
      {} as Record<string, string>,
    );
    return { values: initialValues, touched: {} };
  });

  // Sync local open state with prop
  useEffect(() => {
    if (openIntent === undefined) return;
    _setOpen(openIntent);
  }, [openIntent]);

  // Reset form when schema or initial values change
  useEffect(() => {
    const resetValues = schema.fields.reduce(
      (acc, field) => {
        acc[field.id] = initalValues?.[field.id] ?? "";
        return acc;
      },
      {} as Record<string, string>,
    );
    setFormState({ values: resetValues, touched: {} });
  }, [schema, initalValues]);

  // Validate form on value change
  const currentErrors = useMemo(
    () => validate(schema.fields, formState.values),
    [formState.values, schema.fields],
  );

  const isFormValid = currentErrors.length === 0;

  const handleOpenChange = (next: boolean) => {
    _setOpen(next);
    onOpenChange?.(next);
    if (!next) onCancel?.();
  };

  const setFieldValue = (id: string, value: string) => {
    setFormState((prev) => ({
      ...prev,
      values: { ...prev.values, [id]: value },
    }));
  };

  const getErrorFor = (id: string) => {
    return currentErrors.find((error) => error.id === id)?.message;
  };

  const handleSubmit = async () => {
    if (!isFormValid || submitting) return;
    try {
      await onSubmit();
    } catch (e) {
      console.error("Submit failed", e);
    }
  };

  const handleBlur = (id: string) => {
    setFormState((prev) => ({
      ...prev,
      touched: { ...prev.touched, [id]: true },
    }));
  };

  async function onSubmit() {
    const vals = formState.values;

    const rpc = getTauRPC();

    // Convert vals (Record<string, string>) to ApiSubmitResponse[]
    // Assuming vals is an object where keys are ids and values are the values
    const x: ApiSubmitResponse[] = Object.entries(vals).map(([id, value]) => ({
      id,
      value,
    }));
    let res: boolean = false;
    try {
      res = await rpc.capabilities.api_key_submit_response(x);
    } catch (e) {
      const message =
        e && typeof e === "object" && "message" in e
          ? (e as { message?: string }).message
          : String(e);
      toast.error(`Submit failed: ${message}`);
      return;
    }

    if (res) {
      // Now we can fire an onSuccess()
      toast.success("API key accepted");
      _setOpen(false);
      onComplete?.();
    } else {
      // Or an onError()
      toast.error("API Key invalid.");
    }
  }

  return (
    <Dialog open={_open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-[calc(100%-2rem)] rounded-lg border border-neutral-800 bg-[#0e0e0f] p-0 text-white sm:max-w-lg">
        <DialogHeader className="border-border/40 border-b px-6 py-5">
          <DialogTitle className="inline-flex items-center gap-2 align-middle font-bold text-2xl">
            <VerifiedIcon />
            {schema.title}
          </DialogTitle>
          <DialogDescription className="mt-1 text-muted-foreground text-sm">
            {schema.description ??
              "This provider requires an API key to be usable."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-6">
          {schema.fields.map((field) => {
            const value = formState.values[field.id] ?? "";
            const errorMsg = formState.touched[field.id]
              ? getErrorFor(field.id)
              : undefined;

            return (
              <div key={field.id} className="space-y-2">
                <label
                  className="flex items-center justify-between"
                  htmlFor={`__VMM_API_KEY_INPUT_${field.id}`}
                >
                  <span className="font-medium text-sm">{field.label}</span>
                  {field.help && (
                    <span className="ml-2 text-muted-foreground text-xs">
                      {field.help}
                    </span>
                  )}
                </label>

                <Input
                  id={`__VMM_API_KEY_INPUT_${field.id}`}
                  type={field.field_type === "Password" ? "password" : "text"}
                  value={value}
                  onChange={(e) => setFieldValue(field.id, e.target.value)}
                  placeholder={field.placeholder ?? ""}
                  aria-invalid={!!errorMsg}
                  onBlur={() => handleBlur(field.id)}
                  autoComplete="off"
                />

                {errorMsg && (
                  <p className="text-destructive text-xs">{errorMsg}</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2 border-border/40 border-t px-6 py-4">
          <Button
            variant="ghost"
            className="text-muted-foreground"
            type="button"
            onClick={() => handleOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            className="font-semibold"
            type="button"
            disabled={submitting || !isFormValid}
            onClick={handleSubmit}
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
