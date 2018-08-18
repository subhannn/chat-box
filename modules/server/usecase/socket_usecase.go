package usecase

import (
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
			fmt.Println("Emit chat-"+userId, from)
			val.Emit("chat-"+userId, from)
		}
	} else {
		fmt.Println("No socket with userid ", userId)
	}
}

func (c *socketUseCaseImpl) onConnected(so socketio.Socket) {
	so.On("chat", func(msg SocketMessage) {
		session := c.socketSession.Get(msg.UserId)
		if session != nil {
			user := session.User().(*model.User)
			chat := &model.Chat{
				RoomId: msg.UserId,
				UserId: &user.ID,
				Text:   msg.Text,
				From:   "visitor",
				Type:   "chat",
			}
			err := c.query.SaveChat(*chat)
			if err == nil {
				conn := session.Connection()
				for _, val := range conn {
					val.Emit("chat-"+msg.UserId, msg)
				}

				c.channel <- &msg
			}
		}
	})
	so.On("register", func(msg SocketMessage) {
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
