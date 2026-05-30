package repositories

import (
	"github.com/ShashankShekhar9839/rationale/internal/models"
	"gorm.io/gorm"
)

type decisionRepository struct {
	db *gorm.DB
}

type DecisionRepository interface {
	CreateDecision(
		decision *models.Decision,
	) error

	CheckProjectOwnership(
		userID uint,
		projectID uint,
	) (bool, error)
}

func NewDecisionRepository(
	db *gorm.DB,
) DecisionRepository {
	return &decisionRepository{
		db: db,
	}
}

func (r *decisionRepository) CreateDecision(
	decision *models.Decision,
) error {

	return r.db.Create(decision).Error
}

func (r *decisionRepository) CheckProjectOwnership(
	userID uint,
	projectID uint,
) (bool, error) {

	var count int64

	err := r.db.
		Model(&models.Project{}).
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
		Count(&count).Error

	if err != nil {
		return false, err
	}

	return count > 0, nil
}