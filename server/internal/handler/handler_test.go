package handler

import (
	"checkin/internal/models"
	"net/http"
	"net/http/httptest"
	"os"
	"path"
	"runtime"
	"strings"
	"testing"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

type MockCheckinStore struct {
	completion models.Completion
}

func (s *MockCheckinStore) CheckIn(completion models.Completion) (models.Checkin, error) {
	s.completion = completion
	return models.Checkin{}, nil
}
func (s *MockCheckinStore) GetCheckinsForDate(user string, time time.Time) ([]models.Checkin, error) {
	return []models.Checkin{}, nil
}
func (s *MockCheckinStore) GetYearlyStats(date time.Time, user string) (models.YearStats, error) {
	return models.YearStats{}, nil
}

// Make it possible to find practices.json when running test
func init() {
	_, filename, _, _ := runtime.Caller(0)
	dir := path.Join(path.Dir(filename), "..")
	err := os.Chdir(dir)
	if err != nil {
		panic("Couldn't change to directory under test; tests will fail!")
	}
}

func TestCheckIn(t *testing.T) {
	store := MockCheckinStore{}
	e := echo.New()

	// Valid checkin
	completion := models.Completion{User: "tom", Meditation: "Shoonya"}
	validJson := `{"user_name": "tom", "meditation": "Shoonya"}`
	req := httptest.NewRequest(http.MethodPut, "/", strings.NewReader(validJson))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	h := &handler{&store}

	if assert.NoError(t, h.CheckIn(c)) {
		assert.Equal(t, http.StatusCreated, rec.Code)
		assert.Equal(t, completion, store.completion)
	}

	// Invalid meditation
	invalidJson := `{"user_name": "tom", "meditation": "INVALID"}`
	req = httptest.NewRequest(http.MethodPut, "/", strings.NewReader(invalidJson))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec = httptest.NewRecorder()
	c = e.NewContext(req, rec)

	err := h.CheckIn(c)
	if err != nil {
		t.Fatal(err)
	}

	assert.Equal(t, http.StatusBadRequest, rec.Code)
}
