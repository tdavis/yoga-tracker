package practices

import (
	"checkin/internal/models"
	"encoding/json"
	"os"
)

func ReadPractices() ([]models.Practice, error) {
	var practices []models.Practice
	content, err := os.ReadFile("./practices.json")
	if err != nil {
		return practices, err
	}
	err = json.Unmarshal(content, &practices)
	if err != nil {
		return practices, err
	}
	return practices, nil
}
