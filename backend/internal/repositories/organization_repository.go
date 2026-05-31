package repositories

import (
	"github.com/ShashankShekhar9839/rationale/internal/db"
	"github.com/ShashankShekhar9839/rationale/internal/models"
)

func CreateOrganization(
	organization *models.Organization,
) error {

	result := db.DB.Create(organization)

	return result.Error
}

func GetOrganizationsByOwnerID(ownerID uint) ([]models.Organization, error) {

	var organizations []models.Organization

	result := db.DB.Where("owner_id = ?", ownerID).Find(&organizations)

	return organizations, result.Error
}

func GetOrganizationByID(
	id string,
	ownerID uint,
) (models.Organization, error) {

	var organization models.Organization

	result := db.DB.Where("owner_id = ?", ownerID).First(&organization, id)

	return organization, result.Error
}
