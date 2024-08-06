package context

import (
	"checkin/internal/storage"

	"github.com/labstack/echo/v4"
)

type CustomContext struct {
	echo.Context
	CheckinStore storage.CheckinStore
}
