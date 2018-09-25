package presenter

import (
	"context"
	"log"
	"net/http"
	"os"
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
	ec.GET("/", func(c echo.Context) error {
		q := c.QueryParams()
		if len(q) > 0 {
			return c.Redirect(302, os.Getenv("WIDGET_URL")+"/bundle.js")
		} else {
			return c.String(404, `Not Found`)
		}
	})

	ec.Any("/ws/", func(c echo.Context) error {
		origin := c.Request().Header.Get("Origin")
		c.Response().Header().Set("Access-Control-Allow-Credentials", "true")
		c.Response().Header().Set("Access-Control-Allow-Origin", origin)
		token := c.QueryParam("token")
		account, err := s.serverQuery.GetAccount(token)
		ctx := context.WithValue(c.Request().Context(), "account", account)
		newReq := c.Request().WithContext(ctx)
		s.socketServer.SetAllowRequest(func(h *http.Request) error {
			return err
		})

		s.socketServer.ServeHTTP(c.Response(), newReq)
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
