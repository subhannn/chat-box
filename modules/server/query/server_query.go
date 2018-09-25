package query

import (
	"errors"
	"fmt"
	"time"

	"github.com/jinzhu/gorm"
	"telegram.chatbox/helper"
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

	if admin.Alias == nil {
		na := `Admin`
		admin.Alias = &na
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

func (u *serverQueryImpl) DeleteAlias(id uint64) error {
	err := u.db.Exec(`UPDATE admin_aliases set alias = NULL where "adminId" = ?`, id).Error
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
	fmt.Println(alias)
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
		Email     string    `json:"email"`
		Type      string    `json:"type"`
		Timestamp float64   `json:"timestamp"`
		Time      time.Time `json:"time"`
		Photo     *string   `json:"photo"`
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

	for index, val := range chat {
		if val.Email != "" {
			photo := helper.GetGravatarUrl(val.Email)
			chat[index].Photo = &photo
		}
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

func (u *serverQueryImpl) GetAccount(accountKey string) (*model.Account, error) {
	account := model.Account{}
	if err := u.db.Table("accounts").Where(`"accountKey" = ?`, accountKey).Scan(&account).Error; err != nil {
		if err != gorm.ErrRecordNotFound {
			return nil, err
		}
	}

	if account == (model.Account{}) {
		return nil, errors.New("Not found")
	}

	return &account, nil
}
