use std::sync::Arc;

use crate::traits::ModProvider;

pub enum GameProviderError {
    MissingBuilder(String),
    BuildFailed(String),
    InvalidModProviderId(String),
}

#[async_trait::async_trait]
pub trait GameProvider: Send + Sync {
    fn game_id(&self) -> &str;

    fn mod_provider_id(&self) -> &str;

    async fn build_mod_provider(&self, id: &str) -> Result<Arc<dyn ModProvider + Send + Sync>, GameProviderError>;
}
