package usecase

import (
	"fmt"
	"regexp"
	"strconv"
	"time"

	"github.com/sirupsen/logrus"
	tb "gopkg.in/tucnak/telebot.v2"
	"telegram.chatbox/helper"
	"telegram.chatbox/modules/server/model"
	"telegram.chatbox/modules/server/query"
)

type telegramUseCaseImpl struct {
	bot     *tb.Bot
	channel chan *TelegramMessage
	query   query.Server
}

func NewTelegramUseCase(bot *tb.Bot, query *query.Server) Telegram {
	tel := &telegramUseCaseImpl{
		bot:     bot,
		channel: make(chan *TelegramMessage),
		query:   *query,
	}
	tel.init()

	return tel
}

func (s *telegramUseCaseImpl) init() {
	s.bot.Handle(tb.OnText, s.OnNewMessage)
	s.bot.Handle("/start", s.OnCommandStart)
	s.bot.Handle("/alias", s.OnRegisterAlias)
	s.bot.Handle("/endchat", s.OnCommandEndChat)

	s.bot.Handle("/help", s.OnCommandHelp)
}

func (s *telegramUseCaseImpl) Send(from SocketMessage, chatId string, message string) error {
	recipent := &TelegramSender{
		ChatId: chatId,
	}
	newMsg := formatMessageFromClient(from, message)
	if from.Type == "intro" {
		newMsg = formatIntroMessageFromClient(from)
	}
	s.bot.Send(recipent, newMsg, tb.ModeHTML)
	return nil
}

func (s *telegramUseCaseImpl) Channel() chan *TelegramMessage {
	return s.channel
}

func (s *telegramUseCaseImpl) OnNewMessage(m *tb.Message) {
	if m.ReplyTo != nil {
		reg := regexp.MustCompile(`^.*\((.*)\)\s\:`)
		match := reg.FindStringSubmatch(m.ReplyTo.Text)

		if len(match) > 1 {
			admin := &model.AdminAlias{
				AdminId:  m.Sender.ID,
				Username: m.Sender.Username,
				Name:     m.Sender.FirstName + ` ` + m.Sender.LastName,
			}
			err := s.query.AdminCreateOrUpdate(admin)
			if err != nil {
				fmt.Println("err q ", err)
				helper.Log(logrus.PanicLevel, err.Error(), "Receive Message", "error query get alias")
				return
			}
			// save chat
			chat := &model.Chat{
				RoomId:  match[1],
				AdminId: &admin.ID,
				Text:    m.Text,
				From:    "admin",
				Type:    "chat",
			}

			err = s.query.SaveChat(chat)
			fmt.Println("err", err)
			if err == nil {
				s.channel <- &TelegramMessage{
					ID:     &chat.ID,
					Text:   m.Text,
					UserId: match[1],
					Alias:  *admin.Alias,
					Name:   admin.Name,
					Time:   time.Now().String(),
					From:   "admin",
					Type:   "chat",
				}
			}
		} else {
			fmt.Println("Message not deliver, not match")
		}
	} else {
		fmt.Println("Message not deliver, not reply")
	}
}
func (s *telegramUseCaseImpl) OnCommandStart(m *tb.Message) {
	chatId := strconv.FormatInt(m.Chat.ID, 10)
	s.bot.Send(m.Chat, "Hello! Chat ID Kamu adalah "+chatId)
}
func (s *telegramUseCaseImpl) OnRegisterAlias(m *tb.Message) {
	reg := regexp.MustCompile(`(add|edit|remove|info)(?:\s([\w\S].+))?`)
	match := reg.FindStringSubmatch(string(m.Payload))

	if len(match) > 1 {
		action := match[1]
		switch action {
		case "add", "edit":
			if len(match[2]) <= 0 {
				fmt.Println("Name not found")
				s.bot.Send(m.Chat, `Please input your alias.
				<code>/alias (add|edit) (youralias)</code>`, tb.ModeHTML)
			} else {
				alias := &model.AdminAlias{
					AdminId:  m.Sender.ID,
					Alias:    &match[2],
					Username: m.Sender.Username,
					Name:     m.Sender.FirstName + ` ` + m.Sender.LastName,
				}

				s.query.SaveAlias(*alias)
				s.bot.Send(m.Chat, `Success save alias`)
			}
		case "remove":
			s.query.DeleteAlias(uint64(m.Sender.ID))
			s.bot.Send(m.Chat, `Success delete alias`)
		case "info":
			info, err := s.query.GetAlias(m.Sender.ID)
			if err != nil {
				s.bot.Send(m.Chat, "Sorry something error on query.")
				return
			}
			if info == nil || info.Alias == nil {
				s.bot.Send(m.Chat, "Your alias is not set.", tb.ModeHTML)
			} else {
				s.bot.Send(m.Chat, "Your alias is <b>"+*info.Alias+"</b>", tb.ModeHTML)
			}
		}
	} else {
		s.bot.Send(m.Chat, `Please input your alias.
		<code>/alias (add|edit) (youralias)</code>
		<code>/alias remove</code>
		<code>/alias info</code>`, tb.ModeHTML)
	}
}

func (s *telegramUseCaseImpl) OnCommandEndChat(m *tb.Message) {
	if m.ReplyTo != nil {
		reg := regexp.MustCompile(`^.*\((.*)\)\s\:`)
		match := reg.FindStringSubmatch(m.ReplyTo.Text)

		if len(match) > 1 {
			admin := &model.AdminAlias{
				AdminId:  m.Sender.ID,
				Username: m.Sender.Username,
				Name:     m.Sender.FirstName + ` ` + m.Sender.LastName,
			}
			err := s.query.AdminCreateOrUpdate(admin)
			if err != nil {
				helper.Log(logrus.PanicLevel, err.Error(), "Endsession", "error query get alias")
				return
			}

			if err := s.endSession(match[1]); err != nil {
				helper.Log(logrus.PanicLevel, err.Error(), "Update Session", "error query get alias")
				return
			}

			s.channel <- &TelegramMessage{
				Text:    *admin.Alias + ` end this chat`,
				UserId:  match[1],
				Name:    *admin.Alias,
				Time:    time.Now().String(),
				From:    "admin",
				Type:    "notification",
				Command: "endsession",
			}
		}
	} else {
		s.bot.Send(m.Chat, `Please reply to user want endchat.`)
	}
}

func (s *telegramUseCaseImpl) OnCommandHelp(m *tb.Message) {
	help := `I can help you for command this bot.

	<b>[Set Admin Alias]</b>
	/alias (add|edit) (youralias) - this command help you for change your name to alias on show to user.
	/alias info - this command help you for show your alias
	/alias remove - this command help you remove your alias
	
	<b></b>
	[User]
	/endchat - this command help you end session chat user, please reply user want endchat with this command.`
	s.bot.Send(m.Chat, help, tb.ModeHTML)
}

func (s *telegramUseCaseImpl) endSession(clientId string) error {
	now := time.Now()

	endSession := &model.User{
		ClientId:       clientId,
		HasEnded:       true,
		LastDisconnect: &now,
	}
	err := s.query.ClientCreateOrUpdate(endSession)

	return err
}

func formatMessageFromClient(from SocketMessage, message string) string {
	text := `<b>` + from.Name + `</b> (` + from.UserId + ") :\n" + message
	return text
}

func formatIntroMessageFromClient(from SocketMessage) string {
	fmt.Println(from)
	text := `<b>` + from.Name + `</b> (` + from.UserId + ") :\nNew User Connected\nEmail : %s\n"
	if from.Phone != "" {
		text += "Phone : " + from.Phone + "\n"
	}
	text += "Message : \n%s"

	text = fmt.Sprintf(text, from.Email, from.Text)

	return text
}
