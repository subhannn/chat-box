package usecase

type Telegram interface {
	Send(from SocketMessage, chatId string, message string) error
	Channel() chan *TelegramMessage
}

type TelegramMessage struct {
	Text    string `json:"text"`
	Name    string `json:"name"`
	Alias   string `json:"alias"`
	Time    string `json:"time"`
	UserId  string `json:"userId"`
	From    string `json:"from"`
	Type    string `json:"type"`
	Command string `json:"command"`
}

type TelegramSender struct {
	ChatId string
}

func (r *TelegramSender) Recipient() string {
	return r.ChatId
}
