package handlers

import (
	"errors"
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

	userID := c.MustGet("userID").(uint)

	version, err := h.versionService.CreateVersion(
		uint(decisionID),
		userID,
		req,
	)

	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, dto.ToDecisionVersionResponse(*version))
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

	userID := c.MustGet("userID").(uint)

	versions, err := h.versionService.GetVersionsByDecisionID(
		uint(decisionID),
		userID,
	)

	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.ToDecisionVersionHistoryResponseList(versions))
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

	userID := c.MustGet("userID").(uint)

	version, err := h.versionService.GetVersionByID(
		uint(versionID),
		userID,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "version not found",
		})
		return
	}

	c.JSON(http.StatusOK, dto.ToDecisionVersionResponse(*version))
}

func (h *DecisionVersionHandler) UpdateVersion(
	c *gin.Context,
) {

	var req dto.UpdateVersionRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	idParam := c.Param("id")

	versionID, err := strconv.ParseUint(
		idParam,
		10,
		64,
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid version id",
		})
		return
	}

	err = h.versionService.UpdateVersion(
		uint(versionID),
		c.MustGet("userID").(uint),
		req,
	)

	if err != nil {

		if errors.Is(err, services.ErrNotLatestVersion) {
			c.JSON(http.StatusForbidden, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to update version",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "version updated",
	})
}
