package services

import (
	"github.com/ShashankShekhar9839/rationale/internal/dto"
	"github.com/ShashankShekhar9839/rationale/internal/models"
	"github.com/ShashankShekhar9839/rationale/internal/repositories"
)

func CreateOrganization(
	request dto.CreateOrganizationRequest,
	userID uint,
) (dto.OrganizationResponse, error) {

	organization := models.Organization{
		Name:        request.Name,
		Description: request.Description,
		OwnerID:     userID,
	}

	err := repositories.CreateOrganization(
		&organization,
	)

	if err != nil {
		return dto.OrganizationResponse{}, err
	}

	return dto.ToOrganizationResponse(
		organization,
	), nil
}

func GetOrganizationsByOwnerID(ownerID uint) (
	[]dto.OrganizationResponse,
	error,
) {

	organizations, err := repositories.GetOrganizationsByOwnerID(ownerID)

	if err != nil {
		return nil, err
	}

	return dto.ToOrganizationResponseList(
		organizations,
	), nil
}

func GetOrganizationByID(
	id string,
	ownerID uint,
) (dto.OrganizationResponse, error) {

	organization, err := repositories.GetOrganizationByID(id, ownerID)

	if err != nil {
		return dto.OrganizationResponse{}, err
	}

	return dto.ToOrganizationResponse(
		organization,
	), nil
}
