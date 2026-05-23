package dto

import (
	"time"

	"github.com/ShashankShekhar9839/rationale/internal/models"
)

type CreateOrganizationRequest struct {
	Name        string `json:"name" binding:"required,min=2"`
	Description string `json:"description"`
}

type OrganizationResponse struct {
	ID          uint
	Name        string
	Description string
	OwnerID     uint
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func ToOrganizationResponse(
	organization models.Organization,
) OrganizationResponse {

	return OrganizationResponse{
		ID:          organization.ID,
		Name:        organization.Name,
		Description: organization.Description,
		OwnerID:     organization.OwnerID,
		CreatedAt:   organization.CreatedAt,
		UpdatedAt:   organization.UpdatedAt,
	}
}

func ToOrganizationResponseList(
	organizations []models.Organization,
) []OrganizationResponse {

	var response []OrganizationResponse

	for _, organization := range organizations {

		response = append(
			response,
			ToOrganizationResponse(organization),
		)
	}

	return response
}