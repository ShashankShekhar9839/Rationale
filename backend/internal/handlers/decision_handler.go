package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/ShashankShekhar9839/rationale/internal/dto"
	"github.com/ShashankShekhar9839/rationale/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
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

func (h *DecisionHandler) GetDecisionsByProjectID(
	c *gin.Context,
) {

	projectIDParam := c.Param("id")

	projectID, err := strconv.ParseUint(
		projectIDParam,
		10,
		64,
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid project id",
		})
		return
	}

	decisions, err := h.decisionService.GetDecisionsByProjectID(
		uint(projectID),
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch decisions",
		})
		return
	}

	response := make(
		[]dto.DecisionResponse,
		0,
		len(decisions),
	)

	for _, decision := range decisions {

		response = append(
			response,
			dto.DecisionResponse{
				ID:          decision.ID,
				Title:       decision.Title,
				Description: decision.Description,
				ProjectID:   decision.ProjectID,
			},
		)
	}

	c.JSON(
		http.StatusOK,
		response,
	)
}

func (h *DecisionHandler) GetDecisionByID(
    c *gin.Context,
) {
    idParam := c.Param("id")

    decisionID, err := strconv.ParseUint(
        idParam,
        10,
        64,
    )

    if err != nil {
        c.JSON(
            http.StatusBadRequest,
            gin.H{
                "error": "invalid decision id",
            },
        )
        return
    }

    decision, err := h.decisionService.GetDecisionByID(
        uint(decisionID),
    )

    if err != nil {

        if errors.Is(err, gorm.ErrRecordNotFound) {
            c.JSON(
                http.StatusNotFound,
                gin.H{
                    "error": "decision not found",
                },
            )
            return
        }

        c.JSON(
            http.StatusInternalServerError,
            gin.H{
                "error": "failed to fetch decision",
            },
        )
        return
    }

    c.JSON(http.StatusOK, decision)
}