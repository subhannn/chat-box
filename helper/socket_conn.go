package helper

import (
	"fmt"
	"sync"

	"github.com/googollee/go-socket.io"
)

type Sessions interface {
	Get(id string) SessionData
	Set(id string, user interface{}, conn socketio.Socket)
	Remove(id string, conn string)
	ClearAll(id string)
}

type sessionData struct {
	connection map[string]socketio.Socket
	user       interface{}
}

func (s *sessionData) AddConnection(conn socketio.Socket) {
	s.connection[conn.Id()] = conn
}

func (s *sessionData) Connection() map[string]socketio.Socket {
	return s.connection
}

func (s *sessionData) User() interface{} {
	return s.user
}

type SessionData interface {
	Connection() map[string]socketio.Socket
	User() interface{}
	AddConnection(conn socketio.Socket)
}

type serverSessions struct {
	sessions map[string]SessionData
	locker   sync.RWMutex
}

func NewServerSessions() *serverSessions {
	return &serverSessions{
		sessions: make(map[string]SessionData),
	}
}

func (s *serverSessions) Get(id string) SessionData {
	s.locker.RLock()
	defer s.locker.RUnlock()

	ret, ok := s.sessions[id]
	if !ok {
		return nil
	}
	return ret
}

func (s *serverSessions) Set(id string, user interface{}, conn socketio.Socket) {
	s.locker.Lock()
	defer s.locker.Unlock()

	ses, ok := s.sessions[id]
	fmt.Println(ok)
	if ok {
		ses.AddConnection(conn)
		s.sessions[id] = ses
	} else {
		ses = &sessionData{
			connection: make(map[string]socketio.Socket),
			user:       user,
		}
		ses.AddConnection(conn)
		s.sessions[id] = ses
	}
}

func (s *serverSessions) Remove(id string, connId string) {
	s.locker.Lock()
	defer s.locker.Unlock()

	conn, ok := s.sessions[id]
	if ok {
		delete(conn.Connection(), connId)
	}
}

func (s *serverSessions) ClearAll(id string) {
	s.locker.Lock()
	defer s.locker.Unlock()

	delete(s.sessions, id)
}
