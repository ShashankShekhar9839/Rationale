package handlers

import (
	"net/http"
	"strconv"

	"github.com/ShashankShekhar9839/rationale/internal/dto"
	"github.com/ShashankShekhar9839/rationale/internal/services"
	"github.com/gin-gonic/gin"
)

type DecisionVersionHandler struct {
	versionService services.DecisionVersionService
}

func NewDecisionVersionHandler(
	versionService services.DecisionVersionService,
) *DecisionVersionHandler {
	return &DecisionVersionHandler{
		versionService: versionService,
	}
}

func (h *DecisionVersionHandler) CreateVersion(
	c *gin.Context,
) {

	decisionIDParam := c.Param("id")

	decisionID, err := strconv.ParseUint(
		decisionIDParam,
		10,
		64,
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid decision id",
		})
		return
	}

	var req dto.CreateDecisionVersionRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	version, err := h.versionService.CreateVersion(
		uint(decisionID),
		req,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to create version",
		})
		return
	}

	response := dto.DecisionVersionResponse{
		ID:            version.ID,
		VersionNumber: version.VersionNumber,
		Label:         version.Label,
		Content:       version.Content,
		DecisionID:    version.DecisionID,
	}

	c.JSON(http.StatusCreated, response)
}

func (h *DecisionVersionHandler) GetVersionsByDecisionID(
	c *gin.Context,
) {

	decisionIDParam := c.Param("id")

	decisionID, err := strconv.ParseUint(
		decisionIDParam,
		10,
		64,
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid decision id",
		})
		return
	}

	versions, err := h.versionService.GetVersionsByDecisionID(
		uint(decisionID),
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch versions",
		})
		return
	}

	response := make(
		[]dto.DecisionVersionHistoryResponse,
		0,
		len(versions),
	)

	for _, version := range versions {
		response = append(
			response,
			dto.DecisionVersionHistoryResponse{
				ID:            version.ID,
				VersionNumber: version.VersionNumber,
				Label:         version.Label,
				CreatedAt:     version.CreatedAt,
			},
		)
	}

	c.JSON(http.StatusOK, response)
}

func (h *DecisionVersionHandler) GetVersionByID(
	c *gin.Context,
) {

	versionIDParam := c.Param("id")

	versionID, err := strconv.ParseUint(
		versionIDParam,
		10,
		64,
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid version id",
		})
		return
	}

	version, err := h.versionService.GetVersionByID(
		uint(versionID),
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "version not found",
		})
		return
	}

	response := dto.DecisionVersionResponse{
		ID:            version.ID,
		VersionNumber: version.VersionNumber,
		Label:         version.Label,
		Content:       version.Content,
		DecisionID:    version.DecisionID,
	}

	c.JSON(http.StatusOK, response)
}