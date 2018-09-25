package query

import (
	"telegram.chatbox/modules/server/model"
)

type Server interface {
	ClientCreateOrUpdate(user *model.User) error
	AdminCreateOrUpdate(user *model.AdminAlias) error
	SaveAlias(admin model.AdminAlias) error
	DeleteAlias(id uint64) error
	GetAlias(id int) (*model.AdminAlias, error)

	SaveChat(chat *model.Chat) error
	GetMessages(roomId string, limit int64, offset float64) (interface{}, error)
	GetAccount(string) (*model.Account, error)
}
