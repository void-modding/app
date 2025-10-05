pub trait ProviderApi {
    fn show_alert(&self, message: String) -> bool;
    fn get_current_game(&self) -> String {
        String::from("payday-2")
    }

}
