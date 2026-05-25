package handlers

import (
	"net/http"

	"github.com/ShashankShekhar9839/rationale/internal/dto"
	"github.com/ShashankShekhar9839/rationale/internal/services"
	"github.com/gin-gonic/gin"
)

type WorkspaceHandler struct {
	workspaceService services.WorkspaceService
}

func NewWorkspaceHandler(
	workspaceService services.WorkspaceService,
) *WorkspaceHandler {
	return &WorkspaceHandler{
		workspaceService: workspaceService,
	}
}

func (h *WorkspaceHandler) CreateWorkspace(c *gin.Context) {
	var req dto.CreateWorkspaceRequest
	

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}
	userID := c.MustGet("userID").(uint)

	workspace, err := h.workspaceService.CreateWorkspace(userID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to create workspace",
		})
		return
	}

	response := dto.WorkspaceResponse{
		ID:             workspace.ID,
		Name:           workspace.Name,
		Description:    workspace.Description,
		OrganizationID: workspace.OrganizationID,
	}

	c.JSON(http.StatusCreated, response)
}