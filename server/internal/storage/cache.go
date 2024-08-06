package storage

import (
	"context"
	"fmt"
	"os"
	"strconv"

	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
)

var cache *redis.Client

func InitCache() error {
	cacheHost := os.Getenv("REDIS_HOST")
	cachePort := os.Getenv("REDIS_PORT")
	cachePassword := os.Getenv("REDIS_PASSWORD")
	dbEnv := os.Getenv("REDIS_DB")

	var cacheDb int
	if dbEnv == "" {
		cacheDb = 0
	} else {
		if value, err := strconv.Atoi(dbEnv); err == nil {
			cacheDb = int(value)
		} else {
			cacheDb = 0
		}
	}

	cache = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", cacheHost, cachePort),
		Password: cachePassword,
		DB:       cacheDb,
	})
	if err := cache.Ping(context.TODO()).Err(); err != nil {
		return err
	}

	fmt.Println("Successfully connected to Redis")

	return nil
}

func GetCache() *redis.Client {
	return cache
}
