package main

import (
	"bufio"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
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

	rec := strings.Split(string(b), " ")
	now := time.Now().UnixMilli()

	user_id, song, bpm := rec[1], rec[2]
	errors := strings.Split(rec[3], ",")
	for i, e := range errors {
		fmt.Printf("%v %v %v %v %v\n", now, song, bpm, i, e)
	}
}

func SongErrs(f io.Reader, userIDFilter string) map[string]int {
	scanner := bufio.NewScanner(f)
	errs := make(map[string]int)
	for scanner.Scan() {
                if userID != userIDFilter {
                    continue
                }
		rec := strings.Split(scanner.Text(), " ")
		userID, song, _e := rec[1], rec[2], rec[5]
		e, err := strconv.Atoi(_e)
		if err != nil {
			log.Fatal(err)
		}
		if e < 0 {
			e = -e
		}
		errs[song] += e
	}
	return errs
}

func Worst(errs map[string]int) string {
	var max int
	var worst string
	for k, v := range errs {
		if v > max {
			max = v
			worst = k
		}
	}
	return worst
}

func next(w http.ResponseWriter, r *http.Request) {
	file, err := os.Open("db.txt")
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	fmt.Fprintf(w, "%s\n", Worst(SongErrs(file, "user_id")))

}

func main() {
	http.Handle("/", http.HandlerFunc(f))
	http.Handle("/next", http.HandlerFunc(next))
	err := http.ListenAndServe(":8000", nil)
	if err != nil {
		panic(err)
	}
}
