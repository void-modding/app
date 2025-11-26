use std::sync::Arc;


use lib_vmm::runtime::Context as AppContext;
use taurpc::Router;
use crate::{core::{DefaultDownloadService}};
use crate::services::{ModService, ModServiceImpl, CapabilityService, CapabilityServiceImpl};



#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run(ctx: Arc<AppContext>, download_service: Arc<DefaultDownloadService>) {
    let router = Router::new()
        .merge(ModServiceImpl{ctx: ctx.clone()}.into_handler())
        .merge(CapabilityServiceImpl{ctx: ctx.clone()}.into_handler());

  tauri::Builder::default()
    .setup(move |app| {
        download_service.set_handle(app.handle().clone());
        Ok(())
    })
    .manage(ctx.clone())
    .invoke_handler(router.into_handler())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
