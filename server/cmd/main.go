package main

import (
	"checkin/internal/handlers"
	"checkin/internal/storage"

	"checkin/internal/context"
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

	e := echo.New()
	e.Debug = true
	e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			cc := &context.CustomContext{c, storage.NewCheckinStore(db, cache)}
			return next(cc)
		}
	})
	e.Use(middleware.CORS())
	e.GET("/checkins/:user/:date", handlers.GetCheckins)
	e.PUT("/complete", handlers.CheckIn)
	e.GET("/practices", handlers.GetPractices)
	e.GET("/stats/:user/:year", handlers.GetYearlyStats)
	e.Logger.Panic(e.Start(":8080"))
}
