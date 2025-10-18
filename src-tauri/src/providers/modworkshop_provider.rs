use std::sync::Arc;
use log::info;
use crate::{core::ProviderApi, traits::ModProvider};


pub struct ModWorkShopProvider {
    api: Arc<dyn ProviderApi>
}

impl ModWorkShopProvider {
    pub fn new(api: Arc<dyn ProviderApi>) -> Self {
        Self { api }
    }
}

#[async_trait::async_trait]
impl ModProvider for ModWorkShopProvider {

    fn configure(&self) -> &crate::traits::ModProviderFeatures {
        todo!("Configure")
    }


    async fn download_mod(&self, _mod_id: String) -> crate::traits::ModDownloadResult {
        //let target = format!("https://api.modworkshop.net/mods/{}", mod_id);
        let target = String::from("https://storage.modworkshop.net/mods/files/53461_71246_ERjHBd1mwDsnSW70RlJ2meqkucPO3JtAsXfpyDU5.zip?filename=Rich%20Presence%20Musical.zip");
        let mut rx = self.api.queue_download(target).await;

        use crate::traits::ModDownloadResult::*;
        loop {
            if rx.changed().await.is_err() {
                return Failed("Download task ended unexpectedly".into());
            }
            match &*rx.borrow() {
                InProgress(p) => {
                    info!("Progress {}", p);
                }
                Completed => return Completed,
                Failed(e) => return Failed(e.clone()),
                Cancelled => return Cancelled,
                _ => {}
            }
        }
    }

    fn register(&self) -> String {
        "core:modworkshop".into()
    }
}
