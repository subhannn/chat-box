package usecase

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/googollee/go-socket.io"
	"telegram.chatbox/helper"
	"telegram.chatbox/modules/server/model"
	"telegram.chatbox/modules/server/query"
	"telegram.chatbox/services"
)

var (
	Connection map[string]string
)

type socketUseCaseImpl struct {
	query         query.Server
	socket        *socketio.Server
	channel       chan *SocketMessage
	socketSession helper.Sessions
	serviceWait   services.WaitConnect
}

func NewSocketUseCase(socket *socketio.Server, query *query.Server) Socket {
	Connection = make(map[string]string)

	soc := &socketUseCaseImpl{
		query:         *query,
		socket:        socket,
		channel:       make(chan *SocketMessage),
		socketSession: helper.NewServerSessions(),
		serviceWait:   services.NewWaitConnect(),
	}
	soc.init()

	return soc
}

func (c *socketUseCaseImpl) init() {
	c.socket.On("connection", c.onConnected)
	c.socket.On("disconnection", c.onDisconnected)
}

func (c *socketUseCaseImpl) Channel() chan *SocketMessage {
	return c.channel
}

func (c *socketUseCaseImpl) Send(from TelegramMessage, userId string, text string) {
	session := c.socketSession.Get(userId)
	if session != nil {
		conn := session.Connection()
		for _, val := range conn {
			// user := session.User().(model.User)
			// from.Photo = helper.GetGravatarUrl(user.Email)

			fmt.Println("Emit chat-"+userId, from)
			val.Emit("chat-"+userId, from)
		}
	} else {
		fmt.Println("No socket with userid ", userId)
	}
}

func (c *socketUseCaseImpl) onConnected(so socketio.Socket) {
	so.On("chat", func(msg SocketMessage) *SocketMessage {
		session := c.socketSession.Get(msg.UserId)
		if session != nil {
			user := session.User().(*model.User)
			chat := &model.Chat{
				RoomId: msg.UserId,
				UserId: &user.ID,
				Text:   msg.Text,
				From:   "visitor",
				Type:   msg.Type,
			}
			err := c.query.SaveChat(chat)
			if err == nil {
				msg.ID = &chat.ID
				msg.Photo = helper.GetGravatarUrl(user.Email)

				c.channel <- &msg
				return &msg
			}
		}

		return nil
	})

	so.On("connected", func(config model.Configuration) *model.Configuration {
		account := so.Request().Context().Value("account").(*model.Account)
		if account == nil {
			return nil
		}

		err := json.Unmarshal([]byte(account.Config), &config)
		if err != nil {
			fmt.Println(err)
			return &config
		}
		config.ChannelId = account.ChannelId

		return &config
	})

	type ms struct {
		ID       uint64      `json:"id"`
		Nama     string      `json:"name"`
		Email    string      `json:"email"`
		Photo    string      `json:"photo"`
		Messages interface{} `json:"messages"`
	}
	so.On("register", func(msg SocketMessage) *ms {
		fmt.Println(msg)
		fmt.Println("Register UserId ", msg.UserId, " With ConnectionID ", so.Id())
		user := &model.User{
			ClientId:    msg.UserId,
			Name:        msg.Name,
			Email:       msg.Email,
			LastConnect: time.Now(),
		}
		err := c.query.ClientCreateOrUpdate(user)
		if err != nil {
			log.Fatal(err)
		}
		Connection[so.Id()] = msg.UserId
		c.socketSession.Set(msg.UserId, user, so)
		c.serviceWait.Register(msg.UserId, msg.Email)

		messages, _ := c.query.GetMessages(msg.UserId, 10, 0)

		t := &ms{
			ID:       user.ID,
			Nama:     user.Name,
			Email:    user.Email,
			Photo:    helper.GetGravatarUrl(user.Email),
			Messages: messages,
		}

		return t
	})
}

func (c *socketUseCaseImpl) onDisconnected(so socketio.Socket) {
	fmt.Println("disconnect ", so.Id())
	userId, ok := Connection[so.Id()]
	if ok {
		c.socketSession.Remove(userId, so.Id())
		sess := c.socketSession.Get(userId)
		if sess != nil && len(sess.Connection()) == 0 {
			c.serviceWait.Run(userId)
			delete(Connection, so.Id())
		}
	}
}
