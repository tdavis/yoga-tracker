package main

import (
	"time"
)

type Completion struct {
	User       string `json:"user_name"`
	Meditation string `json:"meditation"`
}

type Checkin struct {
	Id             int       `json:"id"`
	User           string    `json:"user_name"`
	Meditation     string    `json:"meditation"`
	CompletedAt    time.Time `json:"completed_at"`
	CompletedToday int64     `json:"completed_today"`
}

type Practice struct {
	Name    string `json:"name"`
	Minutes int    `json:"minutes"`
}

type PracticeCounts struct {
	Name  string `json:"name"`
	Count int    `json:"count"`
}

type YearStats = map[string]int
