.PHONY : only build file binary

telegram: main.go
	GOOS=linux GOARCH=amd64 go build -ldflags '-s -w' -ldflags "-X main.Version=`date -u +%Y%m%d%H%M%S`" -o $@