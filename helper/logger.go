package helper

import (
	"log"
	"log/syslog"

	"github.com/sirupsen/logrus"
	logrusSyslog "github.com/sirupsen/logrus/hooks/syslog"
)

const (
	topicLog = "telegram-chatbox-log"

	logTag = "telegram-chatbox-ddd"
)

func logContext(c string, s string) *logrus.Entry {
	return logrus.WithFields(logrus.Fields{
		"topic":   topicLog,
		"context": c,
		"scope":   s,
	})
}

func Log(level logrus.Level, msg string, cotext string, scope string) {

	logrus.SetFormatter(&logrus.JSONFormatter{})

	syslogOutput, err := logrusSyslog.NewSyslogHook("", "", syslog.LOG_INFO, logTag)
	if err != nil {
		log.Printf("error when writing log: %+v\n", err)
		return
	}
	logrus.AddHook(syslogOutput)

	entry := logContext(cotext, scope)
	switch level {
	case logrus.DebugLevel:
		entry.Debug(msg)
	case logrus.InfoLevel:
		entry.Info(msg)
	case logrus.WarnLevel:
		entry.Warn(msg)
	case logrus.ErrorLevel:
		entry.Error(msg)
	case logrus.FatalLevel:
		entry.Fatal(msg)
	case logrus.PanicLevel:
		entry.Panic(msg)
	}
}
