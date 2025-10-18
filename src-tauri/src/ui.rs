use std::sync::Arc;
use tauri::{State};

use crate::core::{Context as AppContext, ProviderEntry};

#[tauri::command]
fn greet() -> String {
    "Hello, world from Rust!".into()
}

#[tauri::command]
async fn list_providers(state: State<'_, Arc<AppContext>>) -> Result<Vec<String>, ()> {
    Ok(state.list_games()
        .iter()
        .map(|g| g.0.clone())
        .collect())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run(ctx: Arc<AppContext>) {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .targets(
                [
                tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Stdout),
                tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Webview),
                tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::LogDir {
                    file_name: Some(String::from("latest.log")),

                })
                ])
            .build(),
        )?;
      }
      Ok(())
    })
    .manage(ctx)
    .invoke_handler(tauri::generate_handler![greet, list_providers])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
