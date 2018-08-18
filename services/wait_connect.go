package services

import (
	"time"
)

type GoRoutine struct {
	userId string
	email  string
	done   chan bool
	cancel chan bool
	wc     WaitConnect
	ticker *time.Ticker
}

func (g *GoRoutine) run() {
	defer func() {
		g.ticker.Stop()
	}()

	go func() {
		time.Sleep(20 * time.Second)
		g.done <- true
	}()

	for {
		select {
		case <-g.done:

			g.wc.Remove(g.userId)
			g.ticker.Stop()
			return
		case <-g.cancel:
			g.ticker.Stop()
			return
		}
	}
}

func (g *GoRoutine) stop() {
	g.cancel <- true
}

type WaitConnect interface {
	Register(userId string, email string)
	Run(userId string)
	Remove(userId string)
}

type WaitConnectImpl struct {
	UsersId map[string]*GoRoutine
}

func NewWaitConnect() WaitConnect {
	return &WaitConnectImpl{
		UsersId: make(map[string]*GoRoutine),
	}
}

func (wc *WaitConnectImpl) Register(userId string, email string) {
	gor, ok := wc.UsersId[userId]
	if ok {
		gor.stop()
		delete(wc.UsersId, userId)
		gor = nil
	}

	gor = &GoRoutine{
		userId: userId,
		email:  email,
		done:   make(chan bool),
		cancel: make(chan bool),
		wc:     wc,
		ticker: time.NewTicker(time.Second),
	}
	wc.UsersId[userId] = gor
}

func (wc *WaitConnectImpl) Run(userId string) {
	gor, ok := wc.UsersId[userId]
	if ok {
		go gor.run()
	}
}

func (wc *WaitConnectImpl) Remove(userId string) {
	delete(wc.UsersId, userId)
}
