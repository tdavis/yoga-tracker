package main

import (
	"context"
	"strconv"
	"time"
)

const DATE_FORMAT = "2006-01-02"

func CompleteMeditation(completion Completion) (Checkin, error) {
	checkin := Checkin{0, completion.User, completion.Meditation, time.Now(), 0}
	db := GetDB()
	cache := GetCache()
	sqlStatement := `INSERT INTO checkins (user_name, meditation, completed_at) VALUES ($1, $2, now()) RETURNING completed_at, id`
	err := db.QueryRow(sqlStatement, completion.User, completion.Meditation).Scan(&checkin.CompletedAt, &checkin.Id)
	if err != nil {
		return checkin, err
	}
	ctx := context.TODO()
	key := checkin.CompletedAt.Format(DATE_FORMAT)
	result := cache.HIncrBy(ctx, checkin.Meditation, key, 1)
	result.Result()
	if value, err := result.Result(); err == nil {
		checkin.CompletedToday = value
	} else {
		return checkin, err
	}
	return checkin, nil
}

func GetCheckinsForDate(user string, time time.Time) ([]Checkin, error) {
	date := time.Format(DATE_FORMAT)
	cache := GetCache()
	ctx := context.TODO()
	var checkins = make([]Checkin, 0)
	rows, err := db.Query("SELECT DISTINCT ON (meditation) id, user_name, meditation, completed_at FROM checkins WHERE user_name = $1 AND completed_at::date = cast($2 as date) ORDER BY meditation, completed_at DESC", user, date)
	if err != nil {
		return checkins, err
	}
	defer rows.Close()
	for rows.Next() {
		checkin := Checkin{}
		err := rows.Scan(&checkin.Id, &checkin.User, &checkin.Meditation, &checkin.CompletedAt)
		if err != nil {
			return checkins, err
		}
		key := checkin.CompletedAt.Format(DATE_FORMAT)
		exists, err := cache.HExists(ctx, checkin.Meditation, key).Result()
		if err != nil {
			return checkins, err
		}

		if exists {
			val, err := cache.HGet(ctx, checkin.Meditation, key).Result()
			if err != nil {
				return checkins, err
			}

			i64, err := strconv.ParseInt(val, 10, 64)
			if err != nil {
				return checkins, err
			} else {
				checkin.CompletedToday = i64
			}
		}
		checkins = append(checkins, checkin)

	}

	return checkins, rows.Err()
}

func YearlyStats(date time.Time, user string) (YearStats, error) {
	yearStats := make(YearStats)
	year := date.Year()
	rows, err := db.Query("SELECT meditation, count(*) FROM checkins WHERE user_name = $1 AND EXTRACT(year FROM completed_at) = $2 GROUP BY meditation", user, year)
	if err != nil {
		return yearStats, err
	}
	defer rows.Close()
	for rows.Next() {
		var meditation string
		var count int
		err := rows.Scan(&meditation, &count)
		if err != nil {
			return yearStats, err
		}
		yearStats[meditation] = count
	}

	return yearStats, nil
}
