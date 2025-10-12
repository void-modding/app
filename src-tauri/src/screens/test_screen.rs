// use iced::{widget::{button, column, text, Column}, Theme};

// pub fn run() -> iced::Result {
//     iced::application(u64::default, update, view)
//         .theme(Theme::Dark)
//         .centered()
//         .run()
// }

// struct CounterApp {
//     count: i32,
//     // text: String
// }

// #[derive(Debug, Clone, Copy)]
// enum Message {
//     Add,
//     Subtract
// }

// fn update(value: &mut u64, message: Message) {
//     match message {
//         Message::Add => *value += 1,
//         Message::Subtract => *value -= 1,
//     }
// }

// fn view(value: &u64) -> Column<Message> {
//     column![
//         text(value),
//         button("+").on_press(Message::Add)
//     ]
// }
