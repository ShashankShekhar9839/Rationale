package services

import (
	"errors"

	"github.com/ShashankShekhar9839/rationale/internal/dto"
	"github.com/ShashankShekhar9839/rationale/internal/models"
	"github.com/ShashankShekhar9839/rationale/internal/repositories"
)

type projectService struct {
	projectRepo repositories.ProjectRepository
}

func NewProjectService(
	projectRepo repositories.ProjectRepository,
) ProjectService {
	return &projectService{
		projectRepo: projectRepo,
	}
}

type ProjectService interface {
	CreateProject(
		userID uint,
		req dto.CreateProjectRequest,
	) (*models.Project, error)

	GetProjects(
		userID uint,
	) ([]models.Project, error)

	GetProjectsByWorkspaceID(
		workspaceID uint,
		userID uint,
	) ([]models.Project, error)

	GetProjectByID(
		projectID uint,
		userID uint,
	) (*models.Project, error)
}

func (s *projectService) CreateProject(
	userID uint,
	req dto.CreateProjectRequest,
) (*models.Project, error) {

	isOwner, err := s.projectRepo.CheckWorkspaceOwnership(
		userID,
		req.WorkspaceID,
	)

	if err != nil {
		return nil, err
	}

	if !isOwner {
		return nil, errors.New("unauthorized workspace access")
	}

	project := &models.Project{
		Name:        req.Name,
		Description: req.Description,
		WorkspaceID: req.WorkspaceID,
	}

	err = s.projectRepo.CreateProject(project)
	if err != nil {
		return nil, err
	}

	return project, nil
}

func (s *projectService) GetProjects(
	userID uint,
) ([]models.Project, error) {

	return s.projectRepo.GetProjects(
		userID,
	)
}

func (s *projectService) GetProjectsByWorkspaceID(
	workspaceID uint,
	userID uint,
) ([]models.Project, error) {

	return s.projectRepo.GetProjectsByWorkspaceID(
		workspaceID,
		userID,
	)
}

func (s *projectService) GetProjectByID(
	projectID uint,
	userID uint,
) (*models.Project, error) {

	return s.projectRepo.GetProjectByID(
		projectID,
		userID,
	)
}
