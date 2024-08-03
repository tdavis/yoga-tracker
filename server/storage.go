package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
)

var db *sql.DB

func InitDB() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	dbHost := os.Getenv("POSTGRES_HOST")
	dbPort := os.Getenv("POSTGRES_PORT")
	dbUser := os.Getenv("POSTGRES_USER")
	dbPass := os.Getenv("POSTGRES_PASSWORD")
	dbName := os.Getenv("POSTGRES_DB")

	connStr := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable", dbHost, dbUser, dbPass, dbName, dbPort)
	db, err = sql.Open("postgres", connStr)

	if err != nil {
		panic(err.Error())
	}

	err = db.Ping()
	if err != nil {
		panic(err.Error())
	}

	fmt.Println("Successfully connected to PostgreSQL")
}

func GetDB() *sql.DB {
	return db
}

var cache *redis.Client

func InitCache() {
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

	fmt.Println("Successfully connected to Redis")
}

func GetCache() *redis.Client {
	return cache
}
