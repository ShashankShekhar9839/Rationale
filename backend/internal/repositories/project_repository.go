package repositories

import (
	"github.com/ShashankShekhar9839/rationale/internal/models"
	"gorm.io/gorm"
)

type projectRepository struct {
	db *gorm.DB
}

type ProjectRepository interface {
	CreateProject(project *models.Project) error

	CheckWorkspaceOwnership(
		userID uint,
		workspaceID uint,
	) (bool, error)

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

func NewProjectRepository(
	db *gorm.DB,
) ProjectRepository {
	return &projectRepository{
		db: db,
	}
}

func (r *projectRepository) CreateProject(
	project *models.Project,
) error {

	if err := r.db.Create(project).Error; err != nil {
		return err
	}

	return r.db.
		Preload("CreatedBy").
		Preload("UpdatedBy").
		First(project, project.ID).Error
}

func (r *projectRepository) CheckWorkspaceOwnership(
	userID uint,
	workspaceID uint,
) (bool, error) {

	var count int64

	err := r.db.
		Model(&models.Workspace{}).
		Joins(
			"JOIN organizations ON organizations.id = workspaces.organization_id",
		).
		Where(
			"workspaces.id = ? AND organizations.owner_id = ?",
			workspaceID,
			userID,
		).
		Count(&count).Error

	if err != nil {
		return false, err
	}

	return count > 0, nil
}

func (r *projectRepository) GetProjects(
	userID uint,
) ([]models.Project, error) {

	var projects []models.Project

	err := r.db.
		Model(&models.Project{}).
		Preload("CreatedBy").
		Preload("UpdatedBy").
		Joins(
			"JOIN workspaces ON workspaces.id = projects.workspace_id",
		).
		Joins(
			"JOIN organizations ON organizations.id = workspaces.organization_id",
		).
		Where(
			"organizations.owner_id = ?",
			userID,
		).
		Order("projects.created_at DESC").
		Find(&projects).Error

	if err != nil {
		return nil, err
	}

	return projects, nil
}

func (r *projectRepository) GetProjectsByWorkspaceID(
	workspaceID uint,
	userID uint,
) ([]models.Project, error) {

	var projects []models.Project

	err := r.db.
		Model(&models.Project{}).
		Preload("CreatedBy").
		Preload("UpdatedBy").
		Joins(
			"JOIN workspaces ON workspaces.id = projects.workspace_id",
		).
		Joins(
			"JOIN organizations ON organizations.id = workspaces.organization_id",
		).
		Where(
			"projects.workspace_id = ? AND organizations.owner_id = ?",
			workspaceID,
			userID,
		).
		Order("projects.created_at DESC").
		Find(&projects).Error

	if err != nil {
		return nil, err
	}

	return projects, nil
}

func (r *projectRepository) GetProjectByID(
	projectID uint,
	userID uint,
) (*models.Project, error) {

	var project models.Project

	err := r.db.
		Preload("CreatedBy").
		Preload("UpdatedBy").
		Joins(
			"JOIN workspaces ON workspaces.id = projects.workspace_id",
		).
		Joins(
			"JOIN organizations ON organizations.id = workspaces.organization_id",
		).
		Where(
			"projects.id = ? AND organizations.owner_id = ?",
			projectID,
			userID,
		).
		First(&project).Error

	if err != nil {
		return nil, err
	}

	return &project, nil
}
