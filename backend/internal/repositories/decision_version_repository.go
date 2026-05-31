package repositories

import (
	"github.com/ShashankShekhar9839/rationale/internal/models"
	"gorm.io/gorm"
)

type decisionVersionRepository struct {
	db *gorm.DB
}

type DecisionVersionRepository interface {
	GetLatestVersion(decisionID uint) (*models.DecisionVersion, error)
	CheckDecisionOwnership(decisionID uint, userID uint) (bool, error)
	CreateVersion(version *models.DecisionVersion) error
	GetVersionsByDecisionID(decisionID uint) ([]models.DecisionVersion, error)
	GetVersionByID(versionID uint, userID uint) (*models.DecisionVersion, error)
	UpdateVersion(version *models.DecisionVersion) error
}

func NewDecisionVersionRepository(db *gorm.DB) DecisionVersionRepository {
	return &decisionVersionRepository{
		db: db,
	}
}

func (r *decisionVersionRepository) CreateVersion(
	version *models.DecisionVersion,
) error {

	return r.db.Create(version).Error
}

func (r *decisionVersionRepository) CheckDecisionOwnership(
	decisionID uint,
	userID uint,
) (bool, error) {

	var count int64

	err := r.db.
		Model(&models.Decision{}).
		Joins("JOIN projects ON projects.id = decisions.project_id").
		Joins("JOIN workspaces ON workspaces.id = projects.workspace_id").
		Joins("JOIN organizations ON organizations.id = workspaces.organization_id").
		Where("decisions.id = ? AND organizations.owner_id = ?", decisionID, userID).
		Count(&count).Error

	if err != nil {
		return false, err
	}

	return count > 0, nil
}

func (r *decisionVersionRepository) GetLatestVersion(
	decisionID uint,
) (*models.DecisionVersion, error) {

	var version models.DecisionVersion

	err := r.db.
		Where("decision_id = ?", decisionID).
		Order("version_number DESC").
		First(&version).Error

	if err != nil {
		return nil, err
	}

	return &version, nil
}

func (r *decisionVersionRepository) GetVersionsByDecisionID(
	decisionID uint,
) ([]models.DecisionVersion, error) {

	var versions []models.DecisionVersion

	err := r.db.
		Where("decision_id = ?", decisionID).
		Order("version_number DESC").
		Find(&versions).Error

	if err != nil {
		return nil, err
	}

	return versions, nil
}

func (r *decisionVersionRepository) GetVersionByID(
	versionID uint,
	userID uint,
) (*models.DecisionVersion, error) {

	var version models.DecisionVersion

	err := r.db.
		Model(&models.DecisionVersion{}).
		Joins("JOIN decisions ON decisions.id = decision_versions.decision_id").
		Joins("JOIN projects ON projects.id = decisions.project_id").
		Joins("JOIN workspaces ON workspaces.id = projects.workspace_id").
		Joins("JOIN organizations ON organizations.id = workspaces.organization_id").
		Where("decision_versions.id = ? AND organizations.owner_id = ?", versionID, userID).
		First(&version).Error

	if err != nil {
		return nil, err
	}

	return &version, nil
}

func (r *decisionVersionRepository) UpdateVersion(
	version *models.DecisionVersion,
) error {

	return r.db.Save(version).Error
}
