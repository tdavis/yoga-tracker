package main

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func CheckIn(c echo.Context) error {
	completion := Completion{}
	c.Bind(&completion)
	checkin, err := CompleteMeditation(completion)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusCreated, checkin)
}

func GetCheckins(c echo.Context) error {
	user := c.Param("user")
	checkins, err := GetCheckinsToday(user)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, checkins)
}
