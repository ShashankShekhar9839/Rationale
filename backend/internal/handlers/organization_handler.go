package handlers

import (
	"net/http"

	"github.com/ShashankShekhar9839/rationale/internal/dto"
	"github.com/ShashankShekhar9839/rationale/internal/services"
	"github.com/ShashankShekhar9839/rationale/internal/utils"

	"github.com/gin-gonic/gin"
)

func CreateOrganization(c *gin.Context) {
	var req dto.CreateOrganizationRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	userIDValue, exists := c.Get("userID")
	if !exists {
		utils.ErrorResponse(c, http.StatusUnauthorized, "User not authenticated")
		return
	}

	userID := userIDValue.(uint)

	orgResp, err := services.CreateOrganization(req, userID)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Organization created", orgResp)
}

func GetOrganizations(c *gin.Context) {
	orgs, err := services.GetOrganizations()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Organizations fetched", orgs)
}

func GetOrganizationByID(c *gin.Context) {
	id := c.Param("id")

	org, err := services.GetOrganizationByID(id)
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Organization not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Organization fetched", org)
}