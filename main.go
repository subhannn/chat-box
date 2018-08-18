package main

import (
	"os"

	"github.com/labstack/echo"
	"github.com/sirupsen/logrus"
	"telegram.chatbox/config"
	"telegram.chatbox/helper"
	"telegram.chatbox/modules/server/presenter"
)

func main() {
	http := echo.New()

	// http.Use(middleware.Logger()

	port := os.Getenv("PORT")

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

	http.Static("/", "client")

	httpServerHandler := presenter.NewHTTPServerHandler(db, telegram)
	httpServerHandler.Mount(http)

	http.Logger.Fatal(http.Start(":" + port))

	// server, err := socketio.NewServer(nil)
	// if err != nil {
	// 	log.Fatal(err)
	// }

	// server.On("connection", func(so socketio.Socket) {

	// 	log.Println("on connection")

	// 	so.Join("chat")

	// 	so.On("chat message", func(msg string) {
	// 		log.Println("emit:", so.Emit("chat message", msg))
	// 		so.BroadcastTo("chat", "chat message", msg)
	// 	})

	// 	so.On("disconnection", func() {
	// 		log.Println("on disconnect")
	// 	})
	// })

	// server.On("error", func(so socketio.Socket, err error) {
	// 	log.Println("error:", err)
	// })

	// http.Handle("/socket.io/", server)

	// fs := http.FileServer(http.Dir("client"))
	// http.Handle("/", fs)

	// log.Println("Serving at localhost:9000...")
	// log.Fatal(http.ListenAndServe(":9000", nil))
}
