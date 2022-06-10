package main

import (
	"fmt"
	"time"
)

func Deltas(ts []time.Duration) []time.Duration {
	ds := make([]time.Duration, len(ts)-1)
	for i:=1; i < len(ts); i++ {
		ds[i-1] = ts[i] - ts[i-1]
	}
	return ds
}

func main() {
	pat := []byte{1, 0, 1, 1, 1, 0}
	for _, v := range pat {
		if v != 0 {
			fmt.Println("---")
		}
		time.Sleep(30 * time.Millisecond)

	}
	ds := make([]time.Duration, 0)
	var x int
	for i := 0; i < len(pat); i++ {
		if pat[i] == 0 {
			continue
		}
		fmt.Scanln(&x)
		fmt.Println("---")
		ds = append(ds, time.Duration(time.Now().UnixMilli()))

	}
	fmt.Println(ds)
	y := ds[0]

	for i, b := range ds {
		if i > 0 {
			fmt.Println("delta", b-ds[i-1])
		} else {
			fmt.Println("delta N/A")
		}
		fmt.Println(b - y)
	}
	fmt.Println("ds", Deltas(ds))
	fmt.Println("---")
	for _, t := range Deltas(ds) {
		time.Sleep(t*time.Millisecond)
		fmt.Println("---")
	}

}
