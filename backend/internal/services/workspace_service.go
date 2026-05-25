package services

import (
	"github.com/ShashankShekhar9839/rationale/internal/dto"
	"github.com/ShashankShekhar9839/rationale/internal/models"
	"github.com/ShashankShekhar9839/rationale/internal/repositories"
)

type WorkspaceService interface {
	CreateWorkspace(
    userID uint,
    req dto.CreateWorkspaceRequest,
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

	workspace := &models.Workspace{
		Name:           req.Name,
		Description:    req.Description,
		OrganizationID: req.OrganizationID,
	}

	err := s.workspaceRepo.CreateWorkspace(workspace)
	if err != nil {
		return nil, err
	}

	return workspace, nil
}