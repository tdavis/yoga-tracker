package handlers

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"checkin/internal/context"
	"checkin/internal/models"
	"checkin/internal/practices"
	"checkin/internal/storage"

	"github.com/labstack/echo/v4"
)

func CheckIn(c echo.Context) error {
	practices, err := practices.ReadPractices()
	if err != nil {
		return internalServerError(c, err)
	}

	completion := models.Completion{}
	c.Bind(&completion)

	var practiceIsValid bool
	for _, practice := range practices {
		if practice.Name == completion.Meditation {
			practiceIsValid = true
		}
	}

	if !practiceIsValid {
		return c.String(http.StatusBadRequest, "Invalid meditation")
	}
	context := c.(*context.CustomContext)
	checkin, err := context.CheckinStore.CheckIn(completion)
	if err != nil {
		return internalServerError(c, err)
	}
	return c.JSON(http.StatusCreated, checkin)
}

func GetCheckins(c echo.Context) error {
	context := c.(*context.CustomContext)
	user := c.Param("user")
	date, err := time.Parse(storage.DATE_FORMAT, c.Param("date"))
	if err != nil {
		return internalServerError(c, err)
	}
	checkins, err := context.CheckinStore.GetCheckinsForDate(user, date)
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
	context := c.(*context.CustomContext)
	fmt.Print(context)
	user := c.Param("user")
	date, err := time.Parse("2006", c.Param("year"))
	if err != nil {
		return internalServerError(c, err)
	}
	stats, err := context.CheckinStore.GetYearlyStats(date, user)
	if err != nil {
		return internalServerError(c, err)
	}
	return c.JSON(http.StatusOK, stats)
}

func internalServerError(c echo.Context, err error) error {
	return c.JSON(http.StatusInternalServerError, err.Error())
}
