package repositories

import (
	"github.com/ShashankShekhar9839/rationale/internal/models"
	"gorm.io/gorm"
)

type decisionVersionRepository struct {
	db *gorm.DB
}

type DecisionVersionRepository interface {
	GetLatestVersion(
		decisionID uint,
	) (*models.DecisionVersion, error)

	CreateVersion(
		version *models.DecisionVersion,
	) error

	GetVersionsByDecisionID(
		decisionID uint,
	) ([]models.DecisionVersion, error)

	GetVersionByID(
	versionID uint,
) (*models.DecisionVersion, error)
}

func NewDecisionVersionRepository(
	db *gorm.DB,
) DecisionVersionRepository {
	return &decisionVersionRepository{
		db: db,
	}
}

func (r *decisionVersionRepository) CreateVersion(
	version *models.DecisionVersion,
) error {

	return r.db.Create(version).Error
}

func (r *decisionVersionRepository) GetLatestVersion(
	decisionID uint,
) (*models.DecisionVersion, error) {

	var version models.DecisionVersion

	err := r.db.
		Where(
			"decision_id = ?",
			decisionID,
		).
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
		Where(
			"decision_id = ?",
			decisionID,
		).
		Order("version_number DESC").
		Find(&versions).Error

	if err != nil {
		return nil, err
	}

	return versions, nil
}

func (r *decisionVersionRepository) GetVersionByID(
	versionID uint,
) (*models.DecisionVersion, error) {

	var version models.DecisionVersion

	err := r.db.
		First(
			&version,
			versionID,
		).Error

	if err != nil {
		return nil, err
	}

	return &version, nil
}