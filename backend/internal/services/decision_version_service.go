package services

import (
	"errors"

	"github.com/ShashankShekhar9839/rationale/internal/dto"
	"github.com/ShashankShekhar9839/rationale/internal/models"
	"github.com/ShashankShekhar9839/rationale/internal/repositories"
	"gorm.io/gorm"
)

type DecisionVersionService interface {
	CreateVersion(
		decisionID uint,
		req dto.CreateDecisionVersionRequest,
	) (*models.DecisionVersion, error)

	GetVersionsByDecisionID(
	decisionID uint,
) ([]models.DecisionVersion, error)

GetVersionByID(
	versionID uint,
) (*models.DecisionVersion, error)
}

type decisionVersionService struct {
	versionRepo repositories.DecisionVersionRepository
}

func NewDecisionVersionService(
	versionRepo repositories.DecisionVersionRepository,
) DecisionVersionService {
	return &decisionVersionService{
		versionRepo: versionRepo,
	}
}

func (s *decisionVersionService) CreateVersion(
	decisionID uint,
	req dto.CreateDecisionVersionRequest,
) (*models.DecisionVersion, error) {

	var nextVersionNumber uint = 1

	latestVersion, err := s.versionRepo.GetLatestVersion(
		decisionID,
	)

	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
	} else {
		nextVersionNumber =
			latestVersion.VersionNumber + 1
	}

	version := &models.DecisionVersion{
		VersionNumber: nextVersionNumber,
		Label:         req.Label,
		Content:       req.Content,
		DecisionID:    decisionID,
	}

	err = s.versionRepo.CreateVersion(version)
	if err != nil {
		return nil, err
	}

	return version, nil
}

func (s *decisionVersionService) GetVersionsByDecisionID(
	decisionID uint,
) ([]models.DecisionVersion, error) {

	return s.versionRepo.GetVersionsByDecisionID(
		decisionID,
	)
}

func (s *decisionVersionService) GetVersionByID(
	versionID uint,
) (*models.DecisionVersion, error) {

	return s.versionRepo.GetVersionByID(
		versionID,
	)
}