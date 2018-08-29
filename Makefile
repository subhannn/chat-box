.PHONY : only build file binary

telegram: main.go
	GOOS=linux GOARCH=amd64 go build -ldflags '-s -w' -o $@