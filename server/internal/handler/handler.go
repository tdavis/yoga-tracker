package handler

import (
	"net/http"
	"os"
	"time"

	"checkin/internal/models"
	"checkin/internal/practices"
	"checkin/internal/storage"

	"github.com/labstack/echo/v4"
)

type handler struct {
	checkinStore storage.CheckinStore
}

func NewHandler(store storage.CheckinStore) *handler {
	return &handler{store}
}

func (h *handler) CheckIn(c echo.Context) error {
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
	checkin, err := h.checkinStore.CheckIn(completion)
	if err != nil {
		return internalServerError(c, err)
	}
	return c.JSON(http.StatusCreated, checkin)
}

func (h *handler) GetCheckins(c echo.Context) error {
	user := c.Param("user")
	date, err := time.Parse(storage.DATE_FORMAT, c.Param("date"))
	if err != nil {
		return internalServerError(c, err)
	}
	checkins, err := h.checkinStore.GetCheckinsForDate(user, date)
	if err != nil {
		return internalServerError(c, err)
	}
	return c.JSON(http.StatusOK, checkins)
}

func (h *handler) GetPractices(c echo.Context) error {
	path, err := practices.FindPracticeFile()
	if err != nil {
		return internalServerError(c, err)
	}

	content, err := os.ReadFile(path)
	if err != nil {
		return internalServerError(c, err)
	}

	return c.JSONBlob(http.StatusOK, content)
}

func (h *handler) GetYearlyStats(c echo.Context) error {
	user := c.Param("user")
	date, err := time.Parse("2006", c.Param("year"))
	if err != nil {
		return internalServerError(c, err)
	}
	stats, err := h.checkinStore.GetYearlyStats(date, user)
	if err != nil {
		return internalServerError(c, err)
	}
	return c.JSON(http.StatusOK, stats)
}

func internalServerError(c echo.Context, err error) error {
	return c.JSON(http.StatusInternalServerError, err.Error())
}
