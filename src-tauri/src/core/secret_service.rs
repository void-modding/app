use keyring::{Entry, Error};

/// Example: "core:provider", will return the value
pub fn load_provider_secret(provider_id: &str) -> Result<String, Error> {
    let entry = Entry::new("void-mod-manager/provider", provider_id)?;
    let pass = entry.get_password()?;
    Ok(pass)
}

pub fn set_provider_secret(provider_id: &str, secret: &str) -> Result<String, Error> {
    let entry = Entry::new("void-mod-manager/provider", provider_id)?;
    entry.set_password(secret)?;
    let pass = entry.get_password()?;
    Ok(pass)
}
