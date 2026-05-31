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

	GetDecisionsByProjectID(
		projectID uint,
		userID uint,
	) ([]models.Decision, error)

	GetDecisionByID(id uint, userID uint) (*models.Decision, error)
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

func (r *decisionRepository) GetDecisionsByProjectID(
	projectID uint,
	userID uint,
) ([]models.Decision, error) {

	var decisions []models.Decision

	err := r.db.
		Model(&models.Decision{}).
		Joins("JOIN projects ON projects.id = decisions.project_id").
		Joins("JOIN workspaces ON workspaces.id = projects.workspace_id").
		Joins("JOIN organizations ON organizations.id = workspaces.organization_id").
		Where(
			"decisions.project_id = ? AND organizations.owner_id = ?",
			projectID,
			userID,
		).
		Order("decisions.created_at DESC").
		Find(&decisions).Error

	if err != nil {
		return nil, err
	}

	return decisions, nil
}

func (r *decisionRepository) GetDecisionByID(
	id uint,
	userID uint,
) (*models.Decision, error) {

	var decision models.Decision

	err := r.db.
		Model(&models.Decision{}).
		Joins("JOIN projects ON projects.id = decisions.project_id").
		Joins("JOIN workspaces ON workspaces.id = projects.workspace_id").
		Joins("JOIN organizations ON organizations.id = workspaces.organization_id").
		Where("decisions.id = ? AND organizations.owner_id = ?", id, userID).
		First(&decision).Error
	if err != nil {
		return nil, err
	}

	return &decision, nil
}
