package services

import (
	"errors"

	"github.com/ShashankShekhar9839/rationale/internal/dto"
	"github.com/ShashankShekhar9839/rationale/internal/models"
	"github.com/ShashankShekhar9839/rationale/internal/repositories"
	"gorm.io/gorm"
)

type decisionService struct {
	decisionRepo repositories.DecisionRepository
	versionRepo  repositories.DecisionVersionRepository
}

type DecisionService interface {
	CreateDecision(
		userID uint,
		req dto.CreateDecisionRequest,
	) (*models.Decision, error)

	GetDecisionsByProjectID(
		projectID uint,
		userID uint,
	) ([]models.Decision, error)

	GetDecisionByID(
		decisionID uint,
		userID uint,
	) (*dto.DecisionDetailsResponse, error)
}

func NewDecisionService(
	decisionRepo repositories.DecisionRepository,
	versionRepo repositories.DecisionVersionRepository,
) DecisionService {
	return &decisionService{
		decisionRepo: decisionRepo,
		versionRepo:  versionRepo,
	}
}

func (s *decisionService) CreateDecision(
	userID uint,
	req dto.CreateDecisionRequest,
) (*models.Decision, error) {

	isOwner, err := s.decisionRepo.CheckProjectOwnership(
		userID,
		req.ProjectID,
	)

	if err != nil {
		return nil, err
	}

	if !isOwner {
		return nil, errors.New(
			"unauthorized project access",
		)
	}

	decision := &models.Decision{
		Title:       req.Title,
		Description: req.Description,
		ProjectID:   req.ProjectID,
		CreatedByID: &userID,
		UpdatedByID: &userID,
	}

	err = s.decisionRepo.CreateDecision(
		decision,
	)

	if err != nil {
		return nil, err
	}

	return decision, nil
}

func (s *decisionService) GetDecisionsByProjectID(
	projectID uint,
	userID uint,
) ([]models.Decision, error) {

	return s.decisionRepo.GetDecisionsByProjectID(
		projectID,
		userID,
	)
}

func (s *decisionService) GetDecisionByID(
	decisionID uint,
	userID uint,
) (*dto.DecisionDetailsResponse, error) {
	decision, err := s.decisionRepo.GetDecisionByID(decisionID, userID)
	if err != nil {
		return nil, err
	}

	latestVersion, err := s.versionRepo.GetLatestVersion(decisionID)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	response := dto.ToDecisionDetailsResponse(*decision, latestVersion)

	return &response, nil
}
