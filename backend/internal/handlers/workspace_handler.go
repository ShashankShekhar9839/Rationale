package handlers

import (
	"net/http"
	"strconv"

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

func (h *WorkspaceHandler) GetWorkspaces(c *gin.Context) {

	userID := c.MustGet("userID").(uint)

	workspaces, err := h.workspaceService.GetWorkspacesByUserID(
		userID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch workspaces",
		})
		return
	}

	response := make([]dto.WorkspaceResponse, 0, len(workspaces))

	for _, workspace := range workspaces {

		response = append(response, dto.WorkspaceResponse{
			ID:             workspace.ID,
			Name:           workspace.Name,
			Description:    workspace.Description,
			OrganizationID: workspace.OrganizationID,
		})
	}

	c.JSON(http.StatusOK, response)
}

func (h *WorkspaceHandler) GetWorkspaceByID(
	c *gin.Context,
) {

	userID := c.MustGet("userID").(uint)

	idParam := c.Param("id")

	workspaceID, err := strconv.ParseUint(
		idParam,
		10,
		64,
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid workspace id",
		})
		return
	}

	workspace, err := h.workspaceService.GetWorkspaceByID(
		uint(workspaceID),
		userID,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "workspace not found",
		})
		return
	}

	response := dto.WorkspaceResponse{
		ID:             workspace.ID,
		Name:           workspace.Name,
		Description:    workspace.Description,
		OrganizationID: workspace.OrganizationID,
	}

	c.JSON(http.StatusOK, response)
}
