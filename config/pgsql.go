package config

import (
	"fmt"
	"os"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
	"telegram.chatbox/helper"
	"telegram.chatbox/modules/server/model"
)

var (
	Configuration Config
)

const (
	thresholdAttempt = 10
)

type Config struct{}

func init() {
	godotenv.Load()
}

func InitDb() (*gorm.DB, error) {

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s fallback_application_name=telegram.chatbox",
		os.Getenv("PG_HOST"), os.Getenv("PG_PORT"), os.Getenv("PG_USER"), os.Getenv("PG_PASS"), os.Getenv("PG_DB_NAME"), os.Getenv("SSL_MODE"))

	fmt.Println("Trying Connect to Database Posgres : ", connStr)
	db, err := gorm.Open("postgres", connStr)
	// db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}

	if err != nil {
		helper.Log(logrus.PanicLevel, err.Error(), "sql.Open", "failed_connect_to_db")
		return nil, err
	}

	fmt.Println("Connected to DB")
	db.LogMode(true)

	err = db.AutoMigrate(&model.User{}, &model.AdminAlias{}, &model.Chat{}, &model.Account{}).Error
	if err != nil {
		return nil, err
	}

	return db, nil
}
