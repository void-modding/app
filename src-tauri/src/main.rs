#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
mod core;
mod binary;
mod frontend;
mod services;

use async_trait::async_trait;
use keyring::Entry;
use lib_vmm::{api::DefaultProviderApi, capabilities::{api_key_capability::{ApiKeyValidationError, ApiSubmitResponse, KeyAction, RequiresApiKey}, base::CapabilityRef, builder::CapabilityBuilder, form::{Field, FormSchema}}, runtime::ContextBuilder, traits::{discovery::{DiscoveryError, DiscoveryQuery, DiscoveryResult, ModExtendedMetadata}, game_provider::{GameMetadata, GameProvider}, mod_provider::{ModDownloadResult, ModProvider}, provider::Provider}};
use tracing::{info, trace, warn};
use tracing_log::LogTracer;
use std::{env, path::Path, sync::{Arc, OnceLock}};

use crate::core::{DefaultDownloadService, load_provider_secret};

#[tokio::main]
async fn main() {
    LogTracer::init().expect("Failed to init logging");
    tracing_subscriber::fmt().with_max_level(tracing::Level::DEBUG).try_init().ok();

    info!("secret: {:?}", load_provider_secret("core:nexusmods"));

    #[cfg(target_os = "linux")]
    {
        info!("Running under the penguin");
        if has_proprietary_linux_driver() && is_wayland() {
            warn!("Wayland + Nvidia doesn't play nicely with Tauri, applying workaround");

            env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");

            let env_var = env::var("WEBKIT_DISABLE_DMABUF_RENDERER");
            // Check if the var applied
            if env_var.is_ok() {
                println!("Success!")
            } else {
                warn!("Workaround failed, goodluck")
            }
        }
    }

    let mut ctx_builder = ContextBuilder::new();

    let download_service = Arc::new(DefaultDownloadService::new());
    let api = DefaultProviderApi::new(download_service.clone()).into_arc();

    // vmm_providers::register_all_providers(&mut ctx_builder, api.clone());

    let mp = TestModProvider::new();
    let gp = Arc::new(TestGameProvider::new());

    ctx_builder
        .register_mod_provider(mp.id(), mp, lib_vmm::registry::ProviderSource::Core)

        .expect("Failed to register mod provider");
    ctx_builder
        .register_game_provider(gp, lib_vmm::registry::ProviderSource::Core)
        .expect("Failed to register game provider");

    let ctx = Arc::new(ctx_builder.freeze());
    api.set_context(Arc::clone(&ctx));
    #[cfg(debug_assertions)]
    ctx.debug_dump();
    frontend::run(ctx, download_service);
}

#[cfg(target_os = "linux")]
fn has_proprietary_linux_driver() -> bool {
    match nvml_wrapper::Nvml::init() {
        Ok(_) => {
            trace!("Nvidia driver detected");
            true
        },
        Err(_) => {
            trace!("Nvidia not detected");
            false
        }
    }
}

#[cfg(target_os = "linux")]
fn is_wayland() -> bool {
    trace!("Wayland check");
    std::env::var("WAYLAND_DISPLAY").is_ok()
}

// Example provider
struct TestGameProvider;
struct TestModProvider {
    capabilities: OnceLock<Vec<CapabilityRef>>,
}

impl TestGameProvider {
    fn new() -> Self {
        Self {}
    }
}

impl TestModProvider {
    fn new() -> Arc<Self> {
        let arc = Arc::new(Self {
            capabilities: OnceLock::new(),
        });

        // build
        let caps = CapabilityBuilder::new_from_arc(&arc)
            .api_key()
            .finish();
        let _ = arc.capabilities.set(caps);
        arc
    }

    fn capabilities_impl(&self) -> &[CapabilityRef] {
        self.capabilities.get().map(|v| v.as_slice()).unwrap_or(&[])
    }
}

impl Provider for TestGameProvider {
    fn id(&self) -> &'static str { "core:test" }
    fn capabilities(&self) -> &[CapabilityRef] {
        &[]
    }
}

impl GameProvider for TestGameProvider {
    fn mod_provider_id(&self) ->  &str { "core:test_mod" }
    fn metadata(&self) -> lib_vmm::traits::game_provider::GameMetadata {
        GameMetadata {
            provider_source: lib_vmm::registry::ProviderSource::Core,
            icon: lib_vmm::traits::game_provider::GameIcon::Path("hey".into()),
            id: self.id().to_string(),
            short_name: "Test".into(),
            display_name: "Test".into(),
        }
    }
    fn install_mod(&self,path: &std::path::PathBuf) -> Result<(),lib_vmm::traits::game_provider::GameInstallError> {
        Ok(())
    }
    fn get_external_id(&self) ->  &str {
        "unused"
    }
}

impl Provider for TestModProvider {
    fn id(&self) -> &'static str { "core:test_mod" }
    fn capabilities(&self) -> &[CapabilityRef] {
        self.capabilities_impl()
    }
}

#[async_trait]
impl ModProvider for TestModProvider {
    async fn download_mod(&self, mod_id: String) -> ModDownloadResult {
        ModDownloadResult::Cancelled
    }

    async fn discover(&self, query: &DiscoveryQuery) -> Result<DiscoveryResult, DiscoveryError> {
        Err(DiscoveryError::ProviderUnavailable)
    }

    async fn get_extended_mod(&self, mod_id: &str) -> ModExtendedMetadata {
        ModExtendedMetadata { header_image: "()".into(), carousel_images: vec![], version: "0.0.0".into(), installed: false, description: "".into() }
    }
}

// Add APIKey implementation test
impl RequiresApiKey for TestModProvider {
    fn on_provided(&self, values: &Vec<ApiSubmitResponse>) -> Result<KeyAction, ApiKeyValidationError> {
        Ok(KeyAction::Store)
    }

    fn needs_prompt(&self, existing_key: Option<&str>) -> bool {
        if existing_key.is_some() {
            info!("A key was successfully passed to the provider {:#?}", existing_key)
        } else {
            info!("No key passed to provider")
        }

        true
    }

    fn render(&self) -> lib_vmm::capabilities::form::FormSchema {
        FormSchema {
            title: "Test".to_string(),
            description: Some("This is a description".to_string()),
            fields: vec![
                Field {
                    id: "key".into(),
                    label: "This key".into(),
                    field_type: Some(lib_vmm::capabilities::form::FieldType::Password),
                    regex: None,
                    help: None,
                    placeholder: Some("Paste here".into())
                }
            ]
        }
    }
}
