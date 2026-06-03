use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let open_home =
                tauri::menu::MenuItem::with_id(app, "open_home", "打开家园", true, None::<&str>)?;
            let hide_home =
                tauri::menu::MenuItem::with_id(app, "hide_home", "隐藏窗口", true, None::<&str>)?;
            let quit = tauri::menu::MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
            let tray_menu = tauri::menu::Menu::with_items(app, &[&open_home, &hide_home, &quit])?;

            tauri::tray::TrayIconBuilder::new()
                .tooltip("status4fpb")
                .icon(
                    app.default_window_icon()
                        .expect("missing default window icon")
                        .clone(),
                )
                .menu(&tray_menu)
                .show_menu_on_left_click(true)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "open_home" => show_main_window(app),
                    "hide_home" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.hide();
                        }
                    }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .build(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn show_main_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
    }
}
