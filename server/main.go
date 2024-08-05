package main

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	InitDB()
	InitCache()

	e := echo.New()
	e.Use(middleware.CORS())
	e.GET("/checkins/:user/:date", GetCheckins)
	e.PUT("/complete", CheckIn)
	e.GET("/practices", GetPractices)
	e.GET("/stats/:user/:year", GetYearlyStats)
	e.Logger.Panic(e.Start(":8080"))
}
