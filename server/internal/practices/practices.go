package practices

import (
	"checkin/internal/models"
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
)

func ReadPractices() ([]models.Practice, error) {
	var practices []models.Practice
	path, err := FindPracticeFile()
	if err != nil {
		return practices, err
	}
	content, err := os.ReadFile(path)
	if err != nil {
		return practices, err
	}
	err = json.Unmarshal(content, &practices)
	if err != nil {
		return practices, err
	}
	return practices, nil
}

var practiceFilePath string

func FindPracticeFile() (string, error) {
	if practiceFilePath != "" {
		return practiceFilePath, nil
	}

	err := filepath.WalkDir(".", func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if !d.IsDir() && d.Name() == "practices.json" {
			practiceFilePath = path
			return filepath.SkipAll
		}

		return nil
	})

	if err != nil {
		return "", err
	}

	if practiceFilePath == "" {
		return "", errors.New("practices.json not found")
	} else {
		return practiceFilePath, nil
	}
}
