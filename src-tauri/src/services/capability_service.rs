use std::sync::Arc;

use lib_vmm::{capabilities::{self, api_key_capability::{ApiKeyValidationError, ApiSubmitResponse, KeyAction}, form::FormSchema}, runtime::Context, traits::mod_provider::ModProvider};
use taurpc::procedures;
use tracing::{error, info, warn};

use crate::core::{load_provider_secret, set_provider_secret};


#[procedures(path = "capabilities")]
pub trait CapabilityService {
    async fn list_capabilities() -> Vec<String>;
    async fn requires_api_key() -> bool;
    async fn api_key_should_show() -> Option<FormSchema>;
    async fn api_key_submit_response(values: Vec<ApiSubmitResponse>) -> Result<bool, ApiKeyValidationError>;
}

#[derive(Clone)]
pub struct CapabilityServiceImpl {
    pub ctx: Arc<Context>
}

impl CapabilityServiceImpl {
    fn get_mod_provider(&self) -> Arc<dyn ModProvider> {
        let provider_id = self.ctx.active_game_required_provider().expect("FIXME: Expect on potential null (Provider not set yet)");
        self.ctx.get_mod_provider(&provider_id).expect("Provider ID is valid, but there's no provider with that ID loaded?") // <- This won't be null if provider_id is valid
    }

}

#[taurpc::resolvers]
impl CapabilityService for CapabilityServiceImpl {
    async fn list_capabilities(self) -> Vec<String> {
        let provider = self.get_mod_provider();
        provider.capabilities().iter().map(|cap| cap.id().to_string()).collect()
    }

    async fn requires_api_key(self) -> bool {
        let provider = self.get_mod_provider();
        provider.capabilities().iter().any(|cap| cap.id() == capabilities::ids::REQUIRES_API_KEY)
    }

    async fn api_key_should_show(self) -> Option<FormSchema> {
        let provider = self.get_mod_provider();

        for cap in provider.capabilities() {
            if let Some(api) = cap.as_requires_api_key() {
                let stored = load_provider_secret(provider.id()).ok();

                let show = api.needs_prompt(stored.as_deref());
                if show {
                    match api.render() {
                        Ok(form) => return Some(form),
                        Err(err) => {
                            error!("[Provider] Failed to get form requirement: {}", err);
                            return None;
                        }
                    }
                }
            }
        }
        None
    }


    async fn api_key_submit_response(
        self,
        values: Vec<ApiSubmitResponse>,
    ) -> Result<bool, ApiKeyValidationError> {
        let provider = self.get_mod_provider();
        let caps = provider.capabilities();

        for cap in caps {
            if let Some(api) = cap.as_requires_api_key() {
                // Capture outcome with additional context
                match api.on_provided(&values) {
                    Ok(action) => {
                        if action == KeyAction::Store {
                            match set_provider_secret(provider.id(), &values[0].value) {
                                Ok(_) => { info!("Successfully stored key!") },
                                Err(err) => { warn!(error = ?err, "Failed to store key");} // <- This is very unlikely to ever happen
                            }
                        }

                        return Ok(true);
                    }
                    Err(err) => {
                        // Propagate to the frontend
                        warn!(error = ?err, "API key validation failed in on_provided");
                        return Err(err);
                    }
                }
            }
        }

        // No capability matched; this is an unexpected provider state
        warn!("Called on_provided() without the provider having an API key requirement!");
        Err(ApiKeyValidationError::ProviderError)
    }

}
