package repositories

import (
	"github.com/ShashankShekhar9839/rationale/internal/models"
	"gorm.io/gorm"
)

type WorkspaceRepository interface {
	CreateWorkspace(workspace *models.Workspace) error
	
	CheckOrganizationOwnership(
	userID uint,
	organizationID uint,
) (bool, error)

GetWorkspacesByUserID(userID uint) ([]models.Workspace, error)
GetWorkspaceByID(
	workspaceID uint,
	userID uint,
) (*models.Workspace, error)
}

type workspaceRepository struct {
	db *gorm.DB
}

func (r *workspaceRepository) CheckOrganizationOwnership(
	userID uint,
	organizationID uint,
) (bool, error) {

	var count int64

	err := r.db.Model(&models.Organization{}).
		Where("id = ? AND owner_id = ?", organizationID, userID).
		Count(&count).Error

	if err != nil {
		return false, err
	}

	return count > 0, nil
}

func NewWorkspaceRepository(db *gorm.DB) WorkspaceRepository {
	return &workspaceRepository{
		db: db,
	}
}

func (r *workspaceRepository) CreateWorkspace(workspace *models.Workspace) error {
	return r.db.Create(workspace).Error
}

func (r *workspaceRepository) GetWorkspacesByUserID(
	userID uint,
) ([]models.Workspace, error) {

	var workspaces []models.Workspace

	err := r.db.
		Joins("JOIN organizations ON organizations.id = workspaces.organization_id").
		Where("organizations.owner_id = ?", userID).
		Find(&workspaces).Error

	if err != nil {
		return nil, err
	}

	return workspaces, nil
}

func (r *workspaceRepository) GetWorkspaceByID(
	workspaceID uint,
	userID uint,
) (*models.Workspace, error) {

	var workspace models.Workspace

	err := r.db.
		Joins("JOIN organizations ON organizations.id = workspaces.organization_id").
		Where(
			"workspaces.id = ? AND organizations.owner_id = ?",
			workspaceID,
			userID,
		).
		First(&workspace).Error

	if err != nil {
		return nil, err
	}

	return &workspace, nil
}