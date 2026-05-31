package services

import (
	"errors"

	"github.com/ShashankShekhar9839/rationale/internal/dto"
	"github.com/ShashankShekhar9839/rationale/internal/models"
	"github.com/ShashankShekhar9839/rationale/internal/repositories"
)

type WorkspaceService interface {
	CreateWorkspace(
		userID uint,
		req dto.CreateWorkspaceRequest,
	) (*models.Workspace, error)

	GetWorkspacesByUserID(
		userID uint,
	) ([]models.Workspace, error)

	GetWorkspaceByID(
		workspaceID uint,
		userID uint,
	) (*models.Workspace, error)
}

type workspaceService struct {
	workspaceRepo repositories.WorkspaceRepository
}

func NewWorkspaceService(
	workspaceRepo repositories.WorkspaceRepository,
) WorkspaceService {
	return &workspaceService{
		workspaceRepo: workspaceRepo,
	}
}

func (s *workspaceService) CreateWorkspace(
	userID uint,
	req dto.CreateWorkspaceRequest,
) (*models.Workspace, error) {

	isOwner, err := s.workspaceRepo.CheckOrganizationOwnership(
		userID,
		req.OrganizationID,
	)

	if err != nil {
		return nil, err
	}

	if !isOwner {
		return nil, errors.New("unauthorized organization access")
	}

	workspace := &models.Workspace{
		Name:           req.Name,
		Description:    req.Description,
		OrganizationID: req.OrganizationID,
		CreatedByID:    &userID,
		UpdatedByID:    &userID,
	}

	err = s.workspaceRepo.CreateWorkspace(workspace)
	if err != nil {
		return nil, err
	}

	return workspace, nil
}

func (s *workspaceService) GetWorkspacesByUserID(
	userID uint,
) ([]models.Workspace, error) {

	return s.workspaceRepo.GetWorkspacesByUserID(
		userID,
	)
}

func (s *workspaceService) GetWorkspaceByID(
	workspaceID uint,
	userID uint,
) (*models.Workspace, error) {

	return s.workspaceRepo.GetWorkspaceByID(
		workspaceID,
		userID,
	)
}
