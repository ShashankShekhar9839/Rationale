package handlers

import (
	"net/http"

	"github.com/ShashankShekhar9839/rationale/internal/dto"
	"github.com/ShashankShekhar9839/rationale/internal/services"

	"github.com/gin-gonic/gin"
)

func CreateOrganization(c *gin.Context) {

	var request dto.CreateOrganizationRequest

	if err := c.ShouldBindJSON(&request); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	userIDValue, exists := c.Get("userID")

	if !exists {

		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "unauthorized",
		})

		return
	}

	userID := userIDValue.(uint)

	organization, err := services.CreateOrganization(
		request,
		userID,
	)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to create organization",
		})

		return
	}

	c.JSON(http.StatusCreated, organization)
}

func GetOrganizations(c *gin.Context) {

	organizations, err := services.GetOrganizations()

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch organizations",
		})

		return
	}

	c.JSON(http.StatusOK, organizations)
}

func GetOrganizationByID(c *gin.Context) {

	id := c.Param("id")

	organization, err := services.GetOrganizationByID(id)

	if err != nil {

		c.JSON(http.StatusNotFound, gin.H{
			"error": "organization not found",
		})

		return
	}

	c.JSON(http.StatusOK, organization)
}