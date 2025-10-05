mod traits;
mod providers;
mod core;
mod binary;

use log::{debug, info};
use traits::ModProvider;
use std::time::SystemTime;

use crate::{core::ProviderApi, providers::NexusMods};

fn setup_logger() -> Result<(), fern::InitError> {


    fern::Dispatch::new()
        .format(|out, message, record| {
            out.finish(format_args!(
                "({}) [{} -> {}] {}",
                humantime::format_rfc3339_seconds(SystemTime::now()),
                record.target(),
                record.level(),
                message
            ))
        })
        .level(log::LevelFilter::Debug)
        .chain(std::io::stdout())
        .apply()?;

    Ok(())
}
#[tokio::main]
async fn main() {
    setup_logger().unwrap();

    info!("Welcome back to development hell");

    let loaded_provider = NexusMods::new(Box::new(PApi));
    // dbg!(loadedProvider.configure());
    loaded_provider.download_mod("mod_id".to_string()).await;

}

struct PApi;

impl ProviderApi for PApi {
    fn show_alert(&self, message: String) -> bool {
        debug!("Show alert hit! {}", message);
        true
    }
}
