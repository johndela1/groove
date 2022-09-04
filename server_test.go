package main

import (
	"strings"
	"testing"
)

func TestWorst(t *testing.T) {
	var exp string
	var res string

	exp = "1111"
	res = Worst(
		map[string]int{
			"1111": 1,
			"2222": 0,
		},
	)
	if exp != res {
		t.Errorf("exp %v got %v", exp, res)
	}

	exp = "1111"
	res = Worst(
		map[string]int{
			"2222": 0,
			"1111": 1,
		},
	)
	if exp != res {
		t.Errorf("exp %v got %v", exp, res)
	}

	exp = "2222"
	res = Worst(
		map[string]int{
			"1111": 0,
			"2222": 1,
		},
	)
	if exp != res {
		t.Errorf("exp %v got %v", exp, res)
	}

	exp = "1111"
	res = Worst(
		map[string]int{
			"1111": 1,
			"2222": 1,
		},
	)
	if exp != res {
		t.Errorf("exp %v got %v", exp, res)
	}

	res = Worst(
		map[string]int{
			"2222": 1,
			"1111": 1,
			"3333": 9,
			"4444": 9,
		},
	)
	if res != "3333" && res != "4444" {
		t.Errorf("exp %v got %v", exp, res)
	}

	res = Worst(
		map[string]int{
			"2222": 1,
			"1111": 10,
			"3333": 9,
			"4444": 9,
		},
	)
	if res != "1111" {
		t.Errorf("exp %v got %v", exp, res)
	}
}

func TestSongErrs(t *testing.T) {
	// timestamp, song, bpm, index, error_ms)
	recs := []string{
		"0 1 1 1 1",
		"0 1 1 1 10",
		"0 2 2 2 2",
	}
	reader := strings.NewReader(strings.Join(recs, "\n"))
	res := SongErrs(reader, "user_id")
	if res["1"] != 11 || res["2"] != 2 {
		t.Errorf("exp map[1:11 2:2] got %v", res)
	}
}
