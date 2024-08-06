package handlers

import (
	"net/http"
	"os"
	"time"

	"checkin/internal/models"
	"checkin/internal/practices"
	"checkin/internal/repo"
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

	checkin, err := repo.CompleteMeditation(completion)
	if err != nil {
		return internalServerError(c, err)
	}
	return c.JSON(http.StatusCreated, checkin)
}

func GetCheckins(c echo.Context) error {
	user := c.Param("user")
	date, err := time.Parse(repo.DATE_FORMAT, c.Param("date"))
	if err != nil {
		return internalServerError(c, err)
	}
	checkins, err := repo.GetCheckinsForDate(user, date)
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
	stats, err := repo.YearlyStats(date, user)
	if err != nil {
		return internalServerError(c, err)
	}
	return c.JSON(http.StatusOK, stats)
}

func internalServerError(c echo.Context, err error) error {
	return c.JSON(http.StatusInternalServerError, err.Error())
}
