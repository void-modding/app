use std::sync::Arc;

use crate::traits::{GameProvider, GameProviderError, ModProvider};

pub struct Payday2Provider {

}

impl Payday2Provider {
    pub fn new() -> Self {
        Self {}
    }
}

#[async_trait::async_trait]
impl GameProvider for Payday2Provider {
    fn game_id(&self) ->  &str {
        "payday_2"
    }

    fn mod_provider_id(&self) ->  &str {
        "core:modworkshop"
    }

    #[allow(elided_named_lifetimes,clippy::type_complexity,clippy::type_repetition_in_bounds)]
    fn build_mod_provider<'life0,'life1,'async_trait>(&'life0 self,id: &'life1 str) ->  ::core::pin::Pin<Box<dyn ::core::future::Future<Output = Result<Arc<dyn ModProvider+Send+Sync>, GameProviderError> > + ::core::marker::Send+'async_trait> >where 'life0:'async_trait,'life1:'async_trait,Self:'async_trait {
        todo!()
    }
}
