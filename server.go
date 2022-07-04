package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"
)

func f(w http.ResponseWriter, r *http.Request) {
	headers := w.Header()
	headers.Add("Access-Control-Allow-Origin", "*")
	headers.Add("Access-Control-Allow-Headers", "Content-Type")
	if r.Method != http.MethodPost {
		log.Println(r.Method, r.URL)
		return
	}
	defer r.Body.Close()
	b, err := io.ReadAll(r.Body)
	if err != nil {
		log.Fatalln(err)
	}

	rec := strings.Split(string(b), "|")
	now := time.Now().UnixMilli()

	song, bpm := rec[0], rec[1]
	errors := strings.Split(rec[2], ",")
	for i, e := range errors {
		fmt.Printf("%v %v %v %v %v\n", now, song, bpm, i, e)
	}
}

func main() {
	http.Handle("/", http.HandlerFunc(f))
	err := http.ListenAndServe(":8000", nil)
	if err != nil {
		panic(err)
	}
}
