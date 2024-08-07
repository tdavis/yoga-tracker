package main

import (
	"checkin/internal/handler"
	"checkin/internal/storage"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	db, err := storage.InitDB()
	if err != nil {
		panic(err)
	}

	cache, err := storage.InitCache()
	if err != nil {
		panic(err)
	}

	store := storage.NewCheckinStore(db, cache)
	handler := handler.NewHandler(&store)

	e := echo.New()
	e.Debug = true
	e.Use(middleware.CORS())
	e.GET("/checkins/:user/:date", handler.GetCheckins)
	e.PUT("/complete", handler.CheckIn)
	e.GET("/practices", handler.GetPractices)
	e.GET("/stats/:user/:year", handler.GetYearlyStats)
	e.Logger.Panic(e.Start(":8080"))
}
