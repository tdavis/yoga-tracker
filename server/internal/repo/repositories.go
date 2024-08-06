package repo

import (
	"checkin/internal/models"
	"checkin/internal/storage"
	"context"
	"strconv"
	"time"
)

const DATE_FORMAT = "2006-01-02"

func CompleteMeditation(completion models.Completion) (models.Checkin, error) {
	checkin := models.Checkin{Id: 0, User: completion.User, Meditation: completion.Meditation, CompletedAt: time.Now(), CompletedToday: 0}
	db := storage.GetDB()
	cache := storage.GetCache()
	sqlStatement := `INSERT INTO checkins (user_name, meditation, completed_at) VALUES ($1, $2, now()) RETURNING completed_at, id`
	err := db.QueryRow(sqlStatement, completion.User, completion.Meditation).Scan(&checkin.CompletedAt, &checkin.Id)
	if err != nil {
		return checkin, err
	}
	ctx := context.TODO()
	key := checkin.CompletedAt.Format(DATE_FORMAT)
	result := cache.HIncrBy(ctx, checkin.Meditation, key, 1)
	if value, err := result.Result(); err == nil {
		checkin.CompletedToday = value
	} else {
		return checkin, err
	}
	return checkin, nil
}

func GetCheckinsForDate(user string, time time.Time) ([]models.Checkin, error) {
	db := storage.GetDB()
	date := time.Format(DATE_FORMAT)
	cache := storage.GetCache()
	ctx := context.TODO()
	var checkins = make([]models.Checkin, 0)
	rows, err := db.Query("SELECT id, user_name, meditation, completed_at FROM checkins WHERE user_name = $1 AND completed_at::date = cast($2 as date) ORDER BY meditation, completed_at DESC", user, date)
	if err != nil {
		return checkins, err
	}
	defer rows.Close()
	for rows.Next() {
		checkin := models.Checkin{}
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

func YearlyStats(date time.Time, user string) (models.YearStats, error) {
	db := storage.GetDB()
	yearStats := make(models.YearStats)
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
