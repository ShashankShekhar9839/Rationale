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
		Where("id = ? AND user_id = ?", organizationID, userID).
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