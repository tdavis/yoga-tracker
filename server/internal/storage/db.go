package storage

import (
	"database/sql"
	"fmt"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"os"
)

var db *sql.DB

func InitDB() error {
	var err error

	if err = godotenv.Load(); err != nil {
		return err
	}

	dbHost := os.Getenv("POSTGRES_HOST")
	dbPort := os.Getenv("POSTGRES_PORT")
	dbUser := os.Getenv("POSTGRES_USER")
	dbPass := os.Getenv("POSTGRES_PASSWORD")
	dbName := os.Getenv("POSTGRES_DB")

	connStr := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable", dbHost, dbUser, dbPass, dbName, dbPort)

	if db, err = sql.Open("postgres", connStr); err != nil {
		return err
	}

	if err = db.Ping(); err != nil {
		return err
	}

	fmt.Println("Successfully connected to PostgreSQL")

	return nil
}

func GetDB() *sql.DB {
	return db
}
