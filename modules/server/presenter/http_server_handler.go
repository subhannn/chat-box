package presenter

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/jinzhu/gorm"

	"github.com/googollee/go-socket.io"
	"github.com/labstack/echo"
	tb "gopkg.in/tucnak/telebot.v2"
	"telegram.chatbox/modules/server/query"
	"telegram.chatbox/modules/server/usecase"
)

type HttpServerHandler struct {
	socketServer *socketio.Server
	db           *gorm.DB
	botTelegram  *tb.Bot
	socket       usecase.Socket
	telegram     usecase.Telegram
	serverQuery  query.Server
}

func NewHTTPServerHandler(db *gorm.DB, bot *tb.Bot) *HttpServerHandler {
	socket, err := socketio.NewServer(nil)
	if err != nil {
		log.Fatal(err)
	}
	socket.SetPingInterval(time.Second)
	var serverQuery query.Server
	serverQuery = query.NewServerQuery(db)

	return &HttpServerHandler{
		socketServer: socket,
		serverQuery:  serverQuery,
		db:           db,
		botTelegram:  bot,
		socket:       usecase.NewSocketUseCase(socket, &serverQuery),
		telegram:     usecase.NewTelegramUseCase(bot, &serverQuery),
	}
}

func (s *HttpServerHandler) Mount(ec *echo.Echo) {
	ec.Any("/socket.io/", func(c echo.Context) error {
		s.socketServer.ServeHTTP(c.Response(), c.Request())
		return nil
	})
	ec.GET("/api/messages", s.getMessages)

	go s.HandleChannel()
}

func (s *HttpServerHandler) HandleChannel() {
	defer close(s.socket.Channel())

	for {
		select {
		case message := <-s.socket.Channel():
			s.telegram.Send(*message, message.ChatId, message.Text)
		case message := <-s.telegram.Channel():
			s.socket.Send(*message, message.UserId, message.Text)
		}
	}
}

func (s *HttpServerHandler) getMessages(c echo.Context) error {
	// s.serverQuery.
	roomId := c.QueryParam("roomId")
	limit := c.QueryParam("limit")
	before := c.QueryParam("before")
	limitInt, err := strconv.ParseInt(limit, 10, 64)
	if len(limit) > 0 && err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid format limit, only positive integer allowed.")
	}
	beforeFlt, err := strconv.ParseFloat(before, 64)
	if len(before) > 0 && err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid format before, only float timestamp is allowed.")
	}

	if len(limit) <= 0 {
		limitInt = 2
	}
	if len(before) <= 0 {
		beforeFlt = 0
	}

	chats, err := s.serverQuery.GetMessages(roomId, limitInt, beforeFlt)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	return c.JSON(http.StatusOK, chats)
}
