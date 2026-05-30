package handlers

import (
	"net/http"

	"github.com/ShashankShekhar9839/rationale/internal/dto"
	"github.com/ShashankShekhar9839/rationale/internal/services"
	"github.com/gin-gonic/gin"
)

type DecisionHandler struct {
	decisionService services.DecisionService
}

func NewDecisionHandler(
	decisionService services.DecisionService,
) *DecisionHandler {
	return &DecisionHandler{
		decisionService: decisionService,
	}
}

func (h *DecisionHandler) CreateDecision(
	c *gin.Context,
) {

	var req dto.CreateDecisionRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	userID := c.MustGet("userID").(uint)

	decision, err := h.decisionService.CreateDecision(
		userID,
		req,
	)

	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{
			"error": err.Error(),
		})
		return
	}

	response := dto.DecisionResponse{
		ID:          decision.ID,
		Title:       decision.Title,
		Description: decision.Description,
		ProjectID:   decision.ProjectID,
	}

	c.JSON(http.StatusCreated, response)
}