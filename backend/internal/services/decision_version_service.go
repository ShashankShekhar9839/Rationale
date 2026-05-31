package services

import (
	"errors"

	"github.com/ShashankShekhar9839/rationale/internal/dto"
	"github.com/ShashankShekhar9839/rationale/internal/models"
	"github.com/ShashankShekhar9839/rationale/internal/repositories"
	"gorm.io/gorm"
)

var ErrNotLatestVersion = errors.New("not latest version")

type DecisionVersionService interface {
	CreateVersion(
		decisionID uint,
		userID uint,
		req dto.CreateDecisionVersionRequest,
	) (*models.DecisionVersion, error)
	GetVersionsByDecisionID(
		decisionID uint,
		userID uint,
	) ([]models.DecisionVersion, error)
	GetVersionByID(
		versionID uint,
		userID uint,
	) (*models.DecisionVersion, error)
	UpdateVersion(
		versionID uint,
		userID uint,
		req dto.UpdateVersionRequest,
	) error
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
	userID uint,
	req dto.CreateDecisionVersionRequest,
) (*models.DecisionVersion, error) {

	isOwner, err := s.versionRepo.CheckDecisionOwnership(decisionID, userID)
	if err != nil {
		return nil, err
	}
	if !isOwner {
		return nil, errors.New("unauthorized decision access")
	}

	var nextVersionNumber uint = 1

	latestVersion, err := s.versionRepo.GetLatestVersion(decisionID)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}
	} else {
		nextVersionNumber = latestVersion.VersionNumber + 1
	}

	version := &models.DecisionVersion{
		VersionNumber: nextVersionNumber,
		Label:         req.Label,
		Content:       req.Content,
		DecisionID:    decisionID,
		CreatedByID:   &userID,
		UpdatedByID:   &userID,
	}

	err = s.versionRepo.CreateVersion(version)
	if err != nil {
		return nil, err
	}

	return version, nil
}

func (s *decisionVersionService) GetVersionsByDecisionID(
	decisionID uint,
	userID uint,
) ([]models.DecisionVersion, error) {

	isOwner, err := s.versionRepo.CheckDecisionOwnership(decisionID, userID)
	if err != nil {
		return nil, err
	}
	if !isOwner {
		return nil, errors.New("unauthorized decision access")
	}

	return s.versionRepo.GetVersionsByDecisionID(decisionID)
}

func (s *decisionVersionService) GetVersionByID(
	versionID uint,
	userID uint,
) (*models.DecisionVersion, error) {

	return s.versionRepo.GetVersionByID(versionID, userID)
}

func (s *decisionVersionService) UpdateVersion(
	versionID uint,
	userID uint,
	req dto.UpdateVersionRequest,
) error {

	version, err := s.versionRepo.GetVersionByID(versionID, userID)
	if err != nil {
		return err
	}

	latestVersion, err := s.versionRepo.GetLatestVersion(version.DecisionID)
	if err != nil {
		return err
	}

	if version.ID != latestVersion.ID {
		return ErrNotLatestVersion
	}

	version.Label = req.Label
	version.Content = req.Content
	version.UpdatedByID = &userID

	return s.versionRepo.UpdateVersion(version)
}
