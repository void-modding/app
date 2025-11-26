use std::sync::Arc;

use lib_vmm::{capabilities::{self, api_key_capability::{ApiKeyCapability, RequiresApiKey}, form::FormSchema, ids::{self, CapabilityId}}, runtime::Context, traits::{mod_provider::ModProvider, provider::Provider}};
use taurpc::procedures;
use tracing::info;
use tracing_log::log;


#[procedures(path = "capabilities")]
pub trait CapabilityService {
    async fn list_capabilities() -> Vec<String>;
    async fn requires_api_key() -> bool;
    async fn api_key_should_show() -> Option<FormSchema>;
}

#[derive(Clone)]
pub struct CapabilityServiceImpl {
    pub ctx: Arc<Context>
}

impl CapabilityServiceImpl {
    fn get_mod_provider(&self) -> Arc<dyn ModProvider> {
        let provider_id = self.ctx.active_game_required_provider().expect("FIXME: Expect on potential null (Provider not set yet)");
        let provider = self.ctx.get_mod_provider(&provider_id).expect("msg");

        provider
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
                let show = api.needs_prompt(None);
                if show {
                    return Some(api.render());
                }
            }
        }
        None
    }
}
