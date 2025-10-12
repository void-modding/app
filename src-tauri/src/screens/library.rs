// use iced::{executor, widget::{button, column, text, Column}, Application, Element, Task};

// /// Messages produced by the `Library` screen.
// #[derive(Debug, Clone)]
// pub enum Message {
//     Select(usize),
// }

// /// State for the Library screen.
// #[derive(Default, Debug)]
// pub struct Library {
//     // add fields as you need (e.g. items, selection, loading state)
// }

// /// Actions that `Library::update` can request the parent to run.
// /// `Run` carries an `iced::Task<Message>` so the parent can `map` it
// /// into the parent's message space.
// pub enum Action {
//     None,
//     Run(Task<Message>),
//     Chat(String)
// }

// impl Library {
//     /// Handle an incoming `Message` for this screen and optionally
//     /// return an `Action` for the parent to execute.
//     pub fn update(&mut self, message: Message) -> Action {
//         match message {
//             Message::Select(id) => {
//                 // Example: at the moment no async work is requested.
//                 // Replace with a Task::perform(...) when you need to do async work.
//                 Action::Chat(format!("contact_{}", id))
//             }
//         }
//     }

//     /// Return the UI for this screen as an `Element<Message>`.
//     /// The parent can call `.map(...)` on the returned `Element` to
//     /// convert the child's `Message` into the parent's message type.
//     pub fn view(&self) -> Element<Message> {
//         column![
//             text("Library"),
//             button("Chat").on_press(Message::Select(192836))
//         ].into()
//     }
// }
