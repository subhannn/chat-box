package main

import (
	"encoding/json"
	"fmt"
	"log"
	"regexp"
	"strconv"
	"time"

	"github.com/kataras/iris"
	"github.com/kataras/iris/context"
	"github.com/kataras/iris/websocket"
	tb "gopkg.in/tucnak/telebot.v2"
)

var (
	Channel    chan *ClientMessage
	Messages   chan *ClientMessage
	Server     *websocket.Server
	Bot        *tb.Bot
	Connection map[string]*ConnectionKv
)

type MessageData struct {
	Text   string `json:"text"`
	ChatId string `json:"chatId"`
	UserId string `json:"userId"`
	Name   string `json:"name"`
	Email  string `json:"email"`
}

type ClientMessage struct {
	Name   string `json:"name"`
	Text   string `json:"text"`
	UserId string `json:"userId"`
	From   string `json:"from"`
	Time   string `json:"time"`
}

type ConnectionKv struct {
	ConnectionId string
	ChatId       string
}

type TelegramChannel struct {
	ChatId string
}

func (r *TelegramChannel) Recipient() string {
	return r.ChatId
}

func main2() {
	app := iris.Default()

	Messages = make(chan *ClientMessage)
	Channel = make(chan *ClientMessage)

	defer close(Messages)
	defer close(Channel)

	Connection = make(map[string]*ConnectionKv)

	port := ":9000"

	app.Handle("GET", "/", func(ctx iris.Context) {
		ctx.ServeFile("index.html", false)
	})

	app.Handle("GET", "/chat.html", func(ctx iris.Context) {
		ctx.Header("Access-Control-Allow-Origin", "*")
		ctx.ServeFile("chat.html", false)
	})
	app.Handle("GET", "/css/chat.css", func(ctx iris.Context) {
		ctx.ServeFile("css/chat.css", false)
	})
	app.Handle("GET", "/dist/js/widget.js", func(ctx iris.Context) {
		ctx.ServeFile("dist/js/widget.js", false)
	})
	app.Handle("GET", "/dist/js/chat.js", func(ctx iris.Context) {
		ctx.ServeFile("dist/js/chat.js", false)
	})
	app.Handle("GET", "/media/ping.mp3", func(ctx iris.Context) {
		ctx.ServeFile("media/ping.mp3", false)
	})

	Server = setupWebsocket(app)

	go ListenWebSocket()

	app.Run(iris.Addr(port))
}

func ListenWebSocket() {
	token := "678470658:AAGEhCHLROYA8u_2fYwFJHJZ8BzlK9c_yVI"
	Bot, err := tb.NewBot(tb.Settings{
		Token:  token,
		Poller: &tb.LongPoller{Timeout: 10 * time.Second},
	})

	if err != nil {
		log.Fatal(err)
		return
	}

	Bot.Handle("/start", func(m *tb.Message) {
		chatId := strconv.FormatInt(m.Chat.ID, 10)
		Bot.Send(m.Chat, "Hello! Chat ID Kamu adalah "+chatId)
	})

	Bot.Handle("/alias", func(m *tb.Message) {
		fmt.Println(m.Payload)
	})

	Bot.Handle(tb.OnText, func(m *tb.Message) {
		if m.ReplyTo != nil {
			fmt.Println("ReplayTo")
			reg := regexp.MustCompile(`^.*\((.*)\)\s\:`)
			match := reg.FindStringSubmatch(m.ReplyTo.Text)

			if len(match) > 1 {
				fmt.Println("Exists")
				var newMessage ClientMessage
				newMessage = ClientMessage{
					Text:   m.Text,
					UserId: match[1],
					Name:   m.Sender.FirstName + " " + m.Sender.LastName,
					Time:   "",
					From:   "admin",
				}

				Channel <- &newMessage
			}
		}
	})

	go ListenNewMessageFromBot()
	go ListenNewMessageFromClient(Bot)

	fmt.Println("Listen Telegram Bot Token : ", token)
	Bot.Start()
}

func ListenNewMessageFromClient(Bot *tb.Bot) {
	for {
		select {
		case msg := <-Messages:
			text := "<b>" + msg.Name + "</b> (" + msg.UserId + ") : \n" + msg.Text
			chatId := Connection[msg.UserId].ChatId
			Bot.Send(&TelegramChannel{ChatId: chatId}, text, tb.ModeHTML)
		}
	}
}

func ListenNewMessageFromBot() {
	for {
		select {
		case message := <-Channel:
			connection := getSocketConnectionByUserId(message.UserId)
			if connection != nil {
				fmt.Println("Send Message To Bot ", message.UserId, message.Text)
				connection.Emit("chat-"+message.UserId, message)
			}
		}
	}
}

func getSocketConnectionByUserId(userId string) websocket.Connection {
	connection := Connection[userId]
	if connection != nil {
		conn := Server.GetConnection(connection.ConnectionId)
		if conn != nil {
			return conn
		}
	}

	return nil
}

func setupWebsocket(app *iris.Application) *websocket.Server {
	// create our echo websocket server
	ws := websocket.New(websocket.Config{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	})
	ws.OnConnection(handleConnection)
	app.Get("/ws", ws.Handler())

	app.Any("/ws.js", func(ctx context.Context) {
		ctx.Write(websocket.ClientSource)
	})

	return ws
}

func removeConnectionByID(connId string) {
	for k, v := range Connection {
		if connId == v.ConnectionId {
			delete(Connection, k)
			fmt.Println("Remove Connection Done", k, v.ConnectionId)
		}
	}
}

func convertToStruct(v interface{}, d interface{}) {
	t, err := json.Marshal(v)
	if err != nil {
		fmt.Println("Error")
		panic(err)
	}
	json.Unmarshal(t, &d)
}

func handleConnection(c websocket.Connection) {
	c.OnDisconnect(func() {
		fmt.Println("Disconnect", c.ID())
		removeConnectionByID(c.ID())
	})

	c.On("disconnect", func(message interface{}) {
		var messageData MessageData
		convertToStruct(message, &messageData)

		fmt.Println("Disconnect", c.ID())
		delete(Connection, messageData.UserId)
	})

	c.On("register", func(message interface{}) {
		var messageData MessageData
		convertToStruct(message, &messageData)

		fmt.Println("User "+messageData.Name+" Registered in ", messageData.UserId)
		Connection[messageData.UserId] = &ConnectionKv{
			ConnectionId: c.ID(),
			ChatId:       messageData.ChatId,
		}
	})

	c.On("chat", func(message interface{}) {
		fmt.Println(message)
		var clientMessage ClientMessage
		convertToStruct(message, &clientMessage)

		fmt.Println("New Message From")
		Messages <- &clientMessage
	})
}
