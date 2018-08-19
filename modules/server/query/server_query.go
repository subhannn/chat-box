package query

import (
	"fmt"
	"time"

	"github.com/jinzhu/gorm"
	"telegram.chatbox/modules/server/model"
)

type serverQueryImpl struct {
	db *gorm.DB
}

func NewServerQuery(db *gorm.DB) Server {
	return &serverQueryImpl{
		db: db,
	}
}

func (u *serverQueryImpl) ClientCreateOrUpdate(user *model.User) error {
	err := u.db.Table("users").Where(`"clientId" = ?`, user.ClientId).Assign(*user).FirstOrCreate(&user).Error
	if err != nil {
		return err
	}

	return nil
}

func (u *serverQueryImpl) AdminCreateOrUpdate(admin *model.AdminAlias) error {
	err := u.db.Table("admin_aliases").Where(`"adminId" = ?`, admin.AdminId).Assign(admin).FirstOrCreate(&admin).Error
	if err != nil {
		return err
	}

	if len(admin.Alias) == 0 {
		admin.Alias = `Admin`
	}

	return nil
}

func (u *serverQueryImpl) SaveAlias(admin model.AdminAlias) error {
	err := u.db.Table("admin_aliases").Where(`"adminId" = ?`, admin.AdminId).Assign(admin).FirstOrCreate(&admin).Error
	if err != nil {
		return err
	}

	return nil
}

func (u *serverQueryImpl) DeleteAlias(id int) error {
	err := u.db.Table("admin_aliases").Where(`"adminId" = ?`, id).Update(model.AdminAlias{Alias: ""}).Error
	if err != nil {
		return err
	}

	return nil
}

func (u *serverQueryImpl) GetAlias(id int) (*model.AdminAlias, error) {
	alias := model.AdminAlias{}
	err := u.db.Table("admin_aliases").Where(`"adminId" = ?`, id).Scan(&alias).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}

	if alias == (model.AdminAlias{}) {
		return nil, nil
	}

	return &alias, nil
}

func (u *serverQueryImpl) SaveChat(chat *model.Chat) error {
	err := u.db.Table("chats").Create(&chat).Error
	if err != nil {
		return err
	}

	return nil
}

func (u *serverQueryImpl) GetMessages(roomId string, limit int64, offset float64) (interface{}, error) {
	query := `select msg.* from (
		select extract(epoch from chats."createdAt" at time zone 'utc' at time zone 'utc') as "timestamp", case when aa."alias" is null then aa."name"
		else aa."alias"
		end as "name", 
		chats."text", chats."from", chats."type", chats."createdAt" as "time", null as "email", chats.id from chats
		join admin_aliases as aa on aa.id = chats."adminId"
		where chats."from" = 'admin' and chats."roomId" = ?
		union
		select extract(epoch from chats."createdAt" at time zone 'utc' at time zone 'utc') as "timestamp", us."name", chats."text", chats."from", chats."type", 
		chats."createdAt" as "time", us.email, chats.id from chats
		join users as us on us.id = chats."userId"
		where chats."from" = 'visitor' and chats."roomId" = ?
	) as msg
	%s
	order by msg."timestamp" desc	
	LIMIT ?`

	chat := []struct {
		ID        uint64    `json:"id"`
		Name      string    `json:"name"`
		Text      string    `json:"text"`
		From      string    `json:"from"`
		Type      string    `json:"type"`
		Timestamp float64   `json:"timestamp"`
		Time      time.Time `json:"time"`
	}{}
	exe := u.db
	if offset != 0 {
		query = fmt.Sprintf(query, `WHERE msg."timestamp" < ?`)
		exe = exe.Raw(query, roomId, roomId, offset, limit)
	} else {
		query = fmt.Sprintf(query, ``)
		exe = exe.Raw(query, roomId, roomId, limit)
	}
	err := exe.Scan(&chat).Error
	if err != nil {
		return nil, err
	}

	bf := 0.0
	if len(chat) > 0 {
		bf = chat[len(chat)-1].Timestamp
	}
	response := struct {
		Data       interface{}            `json:"data"`
		Pagination map[string]interface{} `json:"pagination"`
	}{
		Data: chat,
		Pagination: map[string]interface{}{
			"before": bf,
		},
	}

	return response, nil
}
