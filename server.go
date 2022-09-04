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

	song, bpm := rec[0], rec[1]
	errors := strings.Split(rec[2], ",")
	for i, e := range errors {
		fmt.Printf("%v %v %v %v %v\n", now, song, bpm, i, e)
	}
}

func songErrs(f *os.File, userID string) map[string]int {
	scanner := bufio.NewScanner(f)
	errs := make(map[string]int)
	for scanner.Scan() {
		rec := strings.Split(scanner.Text(), " ")
		song, _e := rec[1], rec[4]
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

func worst(errs map[string]int) string {
	var max int
	var worst string
	for k, v := range errs {
		fmt.Println("val", v)
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

	fmt.Fprintf(w, "%s\n", worst(songErrs(file, "jj")))

}

func main() {
	http.Handle("/", http.HandlerFunc(f))
	http.Handle("/next", http.HandlerFunc(next))
	err := http.ListenAndServe(":8000", nil)
	if err != nil {
		panic(err)
	}
}
