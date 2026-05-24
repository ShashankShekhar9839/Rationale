package repositories

import (
	"github.com/ShashankShekhar9839/rationale/internal/models"
	"gorm.io/gorm"
)

type WorkspaceRepository interface {
	CreateWorkspace(workspace *models.Workspace) error
}

type workspaceRepository struct {
	db *gorm.DB
}

func NewWorkspaceRepository(db *gorm.DB) WorkspaceRepository {
	return &workspaceRepository{
		db: db,
	}
}

func (r *workspaceRepository) CreateWorkspace(workspace *models.Workspace) error {
	return r.db.Create(workspace).Error
}