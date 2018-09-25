package main

import (
	"net"
	"os"

	"github.com/labstack/echo"
	"github.com/sirupsen/logrus"
	"telegram.chatbox/config"
	"telegram.chatbox/helper"
	"telegram.chatbox/modules/server/presenter"
	// "github.com/dgrijalva/jwt-go"
)

func main() {
	http := echo.New()

	port := os.Getenv("PORT")
	// port
	if port == "" {
		port = "9000"
	}

	db, err := config.InitDb()
	if err != nil {
		helper.Log(logrus.PanicLevel, err.Error(), "MakeHandler", "failed to created DB connection")
	}

	telegram, err2 := config.InitTelegram()
	if err2 != nil {
		helper.Log(logrus.PanicLevel, err2.Error(), "MakeHandler", "failed to created Telegram connection")
	}

	http.GET("/", func(c echo.Context) error {
		return c.Redirect(302, "http://localhost:8081/bundle.js")
	})

	// http.Static("/", "client")

	httpServerHandler := presenter.NewHTTPServerHandler(db, telegram)
	httpServerHandler.Mount(http)

	l, err := net.Listen("tcp", ":"+port)
	if err != nil {
		http.Logger.Fatal(l)
	}
	http.Listener = l

	http.Logger.Fatal(http.Start(""))
	// main
}
