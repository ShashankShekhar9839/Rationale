package services

import (
	"errors"

	"github.com/ShashankShekhar9839/rationale/internal/dto"
	"github.com/ShashankShekhar9839/rationale/internal/models"
	"github.com/ShashankShekhar9839/rationale/internal/repositories"
)

type decisionService struct {
	decisionRepo repositories.DecisionRepository
}

type DecisionService interface {
	CreateDecision(
		userID uint,
		req dto.CreateDecisionRequest,
	) (*models.Decision, error)
}

func NewDecisionService(
	decisionRepo repositories.DecisionRepository,
) DecisionService {
	return &decisionService{
		decisionRepo: decisionRepo,
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
	}

	err = s.decisionRepo.CreateDecision(
		decision,
	)

	if err != nil {
		return nil, err
	}

	return decision, nil
}