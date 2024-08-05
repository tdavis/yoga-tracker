package main

import (
	"encoding/json"
	"os"
)

func ReadPractices() ([]Practice, error) {
	var practices []Practice
	content, err := os.ReadFile("./practices.json")
	if err != nil {
		return practices, err
	}
	err = json.Unmarshal(content, &practices)
	if err != nil {
		return practices, err
	}
	return practices, nil
}
