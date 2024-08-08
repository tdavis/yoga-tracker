package storage

import (
	"checkin/internal/models"
	"database/sql"
	"database/sql/driver"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/alicebob/miniredis/v2"
	"github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
)

type AnyDate struct{}

func (a AnyDate) Match(v driver.Value) bool {
	s, _ := v.(string)
	r, _ := regexp.MatchString("[\\d]{4}-[\\d]{2}-[\\d]{2}", s)
	return r
}

type AnyYear struct{}

func (a AnyYear) Match(v driver.Value) bool {
	s, _ := v.(int64)
	return s > 2000
}

func GetDB(t *testing.T) (*sql.DB, sqlmock.Sqlmock) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	return db, mock
}

func GetCache(t *testing.T) (*redis.Client, *miniredis.Miniredis) {
	miniredis := miniredis.RunT(t)
	client := redis.NewClient(&redis.Options{Addr: miniredis.Addr()})
	return client, miniredis
}

func TestCheckIn(t *testing.T) {
	db, sql := GetDB(t)
	defer db.Close()
	cache, redis := GetCache(t)
	defer cache.Close()

	completedAt := time.Now()
	sql.ExpectQuery("INSERT INTO checkins .*").
		WillReturnRows(
			sqlmock.
				NewRows([]string{"completed_at", "id"}).
				AddRow(completedAt, int64(1)))

	store := NewCheckinStore(db, cache)
	completion := models.Completion{User: "user", Meditation: "meditation"}
	result, err := store.CheckIn(completion)
	if err != nil {
		t.Fatal(err)
	}
	count := redis.HGet(result.Meditation, completedAt.Format(DATE_FORMAT))

	assert.Equal(t, "1", count)
	assert.Equal(t, int64(1), result.CompletedToday)
	assert.Equal(t, completedAt, result.CompletedAt)
}

func TestGetCheckinsForDate(t *testing.T) {
	db, sql := GetDB(t)
	defer db.Close()
	cache, redis := GetCache(t)
	defer cache.Close()
	date := time.Now()
	user := "test"

	// Without Redis counter
	mockGetCheckins(user, date, sql)
	store := NewCheckinStore(db, cache)
	result, err := store.GetCheckinsForDate(user, date)
	if err != nil {
		t.Fatal(err)
	}

	assert.Equal(t, 2, len(result))
	assert.Equal(t, models.Checkin{Id: 1, User: user, Meditation: "Shoonya", CompletedAt: date, CompletedToday: int64(0)}, result[0])

	// With Redis counter
	_, err = redis.HIncrBy("Shoonya", date.Format(DATE_FORMAT), 1)
	if err != nil {
		t.Fatal(err)
	}

	mockGetCheckins(user, date, sql)
	result, err = store.GetCheckinsForDate(user, date)
	if err != nil {
		t.Fatal(err)
	}

	assert.Equal(t, 2, len(result))
	assert.Equal(t, int64(1), result[0].CompletedToday)
}
func TestGetYearStats(t *testing.T) {
	db, sql := GetDB(t)
	defer db.Close()
	cache, _ := GetCache(t)
	defer cache.Close()
	date := time.Now()
	user := "test"

	rows := sqlmock.NewRows([]string{"meditation", "count"}).
		AddRow("Shoonya", 1).
		AddRow("Yogasanas", 2)
	sql.ExpectQuery("SELECT meditation, count.+").
		WithArgs(user, AnyYear{}).
		WillReturnRows(rows)

	store := NewCheckinStore(db, cache)
	result, err := store.GetYearlyStats(date, user)
	if err != nil {
		t.Fatal(err)
	}

	assert.Equal(t, 2, len(result))
	assert.Equal(t, map[string]int{"Shoonya": 1, "Yogasanas": 2}, result)
}

func mockGetCheckins(user string, date time.Time, sql sqlmock.Sqlmock) {
	rows := sqlmock.NewRows([]string{"id", "user_name", "meditation", "completed_at"}).
		AddRow(1, user, "Shoonya", date).
		AddRow(2, user, "Yogasanas", date)
	sql.ExpectQuery("SELECT .+ FROM checkins .+").
		WithArgs(user, AnyDate{}).
		WillReturnRows(rows)
}
