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

type Account struct {
	ID         uint64    `gorm:"primary_key" gorm:"column:_id" json:"_id"`
	AccountKey string    `gorm:"column:accountKey" gorm:"index" json:"accountKey"`
	ChannelId  string    `gorm:"column:channelId" json:"channelId"`
	Config     string    `gorm:"column:config;type:json" json:"config"`
	CreatedAt  time.Time `gorm:"column:createdAt" json:"createdAt"`
	UpdatedAt  time.Time `gorm:"column:updatedAt" json:"updatedAt"`
}

type UIConfiguration struct {
	TitleClosed          string `json:"titleClosed"`
	TitleOpen            string `json:"titleOpen"`
	MainColor            string `json:"mainColor"`
	AlwaysFloatingButton bool   `json:"alwaysFloatingButton"`
}

type Settings struct {
	IntroMessage     string `json:"introMessage"`
	AutoResponse     string `json:"autoResponse"`
	AutoNoResponse   string `json:"autoNoResponse"`
	CookieExpiration int    `json:"cookieExpiration"`
	DesktopWidth     int    `json:"desktopWidth"`
	DesktopHeight    int    `json:"desktopHeight"`
}

type Configuration struct {
	AccountKey string          `json:"accountKey"`
	ChannelId  string          `json:"channelId"`
	UI         UIConfiguration `json:"ui"`
	Settings   Settings        `json:"settings"`
	ServerUrl  string          `json:"serverUrl"`
}

// titleClosed: 'Leave a Message',
// titleOpen: 'Customer Care',
// closedStyle: 'chat', // button or chat
// closedChatAvatarUrl: '', // only used if closedStyle is set to 'chat'
// cookieExpiration: 1, // in days. Once opened, closed chat title will be shown as button (when closedStyle is set to 'chat')
// introMessage: 'Hello! How can we help you?',
// autoResponse: 'Looking for the first available admin (It might take a minute)',
// autoNoResponse: 'It seems that no one is available to answer right now. Please tell us how we can ' +
// 'contact you, and we will get back to you as soon as we can.',
// placeholderText: 'Send a message...',
// displayMessageTime: true,
// mainColor: '#78c534',
// alwaysUseFloatingButton: false,
// desktopHeight: 450,
// desktopWidth: 370,
// serverUrl: null,
// isMobile: false,
// origin: null,
