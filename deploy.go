package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os/exec"
)

func main2() {
	http.HandleFunc("/deploy", handleDeploy)

	err := http.ListenAndServe(":8888", nil)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Listen AutoDeploy")
}

type GitPayload struct {
	Ref string `json:"ref"`
}

func handleDeploy(w http.ResponseWriter, r *http.Request) {
	var payload GitPayload
	if r.Body == nil {
		http.Error(w, "Please send a request body", 400)
		return
	}
	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	}

}

func shellExecBranch(ref string) {
	if ref == "refs/heads/master" {
		// cd := exec.Command("cd", "/home/golang/go/src/telegram.chatbox")
		pull := exec.Command("git", "pull", "-f")
		err := pull.Run()
		if err != nil {
			log.Fatal(err)
		}

		fmt.Println("Pull Success")
	}
}
