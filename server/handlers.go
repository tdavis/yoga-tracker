package main

import (
	"net/http"
	"os"
	"time"

	"github.com/labstack/echo/v4"
)

func CheckIn(c echo.Context) error {
	completion := Completion{}
	c.Bind(&completion)
	checkin, err := CompleteMeditation(completion)
	if err != nil {
		return internalServerError(c, err)
	}
	return c.JSON(http.StatusCreated, checkin)
}

func GetCheckins(c echo.Context) error {
	user := c.Param("user")
	date, err := time.Parse(DATE_FORMAT, c.Param("date"))
	if err != nil {
		return internalServerError(c, err)
	}
	checkins, err := GetCheckinsForDate(user, date)
	if err != nil {
		return internalServerError(c, err)
	}
	return c.JSON(http.StatusOK, checkins)
}

func GetPractices(c echo.Context) error {
	content, err := os.ReadFile("./practices.json")
	if err != nil {
		return internalServerError(c, err)
	}

	return c.JSONBlob(http.StatusOK, content)
}

func GetYearlyStats(c echo.Context) error {
	user := c.Param("user")
	date, err := time.Parse("2006", c.Param("year"))
	if err != nil {
		return internalServerError(c, err)
	}
	stats, err := YearlyStats(date, user)
	if err != nil {
		return internalServerError(c, err)
	}
	return c.JSON(http.StatusOK, stats)
}

func internalServerError(c echo.Context, err error) error {
	return c.JSON(http.StatusInternalServerError, err.Error())
}
