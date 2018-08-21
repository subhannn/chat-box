package usecase

type Socket interface {
	Send(from TelegramMessage, userId string, text string)
	Channel() chan *SocketMessage
}

type SocketMessage struct {
	ID      *uint64 `json:"id"`
	Text    string  `json:"text"`
	ChatId  string  `json:"chatId"`
	UserId  string  `json:"userId"`
	Name    string  `json:"name"`
	Email   string  `json:"email"`
	From    string  `json:"from"`
	Type    string  `json:"type"`
	Command string  `json:"command"`
	Photo   string  `json:"photo"`
}
