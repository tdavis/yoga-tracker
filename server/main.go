package main

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	InitDB()
	InitCache()

	e := echo.New()
	// 	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
	//   AllowOrigins: []string{"https://labstack.com", "https://labstack.net"},
	//   AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
	// }))
	e.Use(middleware.CORS())
	e.GET("/checkins/:user", GetCheckins)
	e.PUT("/complete", CheckIn)
	e.Logger.Panic(e.Start(":8080"))
}
