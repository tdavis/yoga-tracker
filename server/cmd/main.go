package main

import (
	"checkin/internal/handlers"
	"checkin/internal/storage"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	if err := storage.InitDB(); err != nil {
		panic(err)
	}

	if err := storage.InitCache(); err != nil {
		panic(err)
	}

	e := echo.New()
	e.Use(middleware.CORS())
	e.GET("/checkins/:user/:date", handlers.GetCheckins)
	e.PUT("/complete", handlers.CheckIn)
	e.GET("/practices", handlers.GetPractices)
	e.GET("/stats/:user/:year", handlers.GetYearlyStats)
	e.Logger.Panic(e.Start(":8080"))
}
