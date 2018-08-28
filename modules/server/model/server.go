package model

import "time"

type User struct {
	ID             uint64     `gorm:"primary_key" gorm:"column:_id" json:"_id"`
	ClientId       string     `gorm:"column:clientId" gorm:"index" json:"clientId"`
	Name           string     `gorm:"column:name" json:"name"`
	Email          string     `gorm:"column:email" json:"email"`
	LastConnect    time.Time  `gorm:"column:lastConnect" gorm:"index" json:"lastConnect"`
	LastDisconnect *time.Time `gorm:"column:lastDiconnect" gorm:"index" json:"lastDisconnect"`
	HasEnded       bool       `gorm:"column:hasEnded" gorm:"index" json:"hasEnded"`
	CreatedAt      time.Time  `gorm:"column:createdAt" json:"createdAt"`
	UpdatedAt      time.Time  `gorm:"column:updatedAt" json:"updatedAt"`
}

type AdminAlias struct {
	ID        uint64    `gorm:"primary_key" gorm:"column:_id" json:"_id"`
	AdminId   int       `gorm:"column:adminId" gorm:"index" json:"adminId"`
	Alias     *string   `gorm:"column:alias" json:"alias"`
	Username  string    `gorm:"column:username" json:"username"`
	Name      string    `gorm:"column:name" json:"name"`
	CreatedAt time.Time `gorm:"column:createdAt" json:"createdAt"`
	UpdatedAt time.Time `gorm:"column:updatedAt" json:"updatedAt"`
}

type Chat struct {
	ID        uint64    `gorm:"primary_key" gorm:"column:_id" json:"_id"`
	RoomId    string    `gorm:"column:roomId" gorm:"index" json:"roomId"`
	UserId    *uint64   `gorm:"column:userId" json:"userId"`
	AdminId   *uint64   `gorm:"column:adminId" json:"adminId"`
	Text      string    `gorm:"column:text" json:"text"`
	From      string    `gorm:"column:from" json:"from"`
	Type      string    `gorm:"column:type" json:"type"`
	CreatedAt time.Time `gorm:"column:createdAt" json:"createdAt"`
	UpdatedAt time.Time `gorm:"column:updatedAt" json:"updatedAt"`
}

type TestTable struct {
	ID        string    `gorm:"primary_key" gorm:"column:id" json:"id"`
	CreatedAt time.Time `gorm:"column:createdAt;type:date" json:"createdAt"`
	UpdatedAt time.Time `gorm:"column:updatedAt;type:date" json:"updatedAt"`
}
