package config

import (
	"fmt"
	"os"
	"time"

	tb "gopkg.in/tucnak/telebot.v2"
)

func init() {

}

func InitTelegram() (*tb.Bot, error) {
	token := os.Getenv("TELEGRAM_TOKEN")
	telegramBot, err := tb.NewBot(tb.Settings{
		Token:  token,
		Poller: &tb.LongPoller{Timeout: 10 * time.Second},
	})
	if err != nil {
		return nil, err
	}

	fmt.Println("Connected to Telegram with token : ", token)

	go func(telegramBot *tb.Bot) {
		telegramBot.Start()
	}(telegramBot)

	return telegramBot, nil
}
