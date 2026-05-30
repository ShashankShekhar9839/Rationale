package handlers

import (
	"net/http"
	"strconv"

	"github.com/ShashankShekhar9839/rationale/internal/dto"
	"github.com/ShashankShekhar9839/rationale/internal/services"
	"github.com/gin-gonic/gin"
)

type ProjectHandler struct {
	projectService services.ProjectService
}

func NewProjectHandler(
	projectService services.ProjectService,
) *ProjectHandler {
	return &ProjectHandler{
		projectService: projectService,
	}
}

func (h *ProjectHandler) CreateProject(
	c *gin.Context,
) {

	var req dto.CreateProjectRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	userID := c.MustGet("userID").(uint)

	project, err := h.projectService.CreateProject(
		userID,
		req,
	)

	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{
			"error": err.Error(),
		})
		return
	}

	response := dto.ProjectResponse{
		ID:          project.ID,
		Name:        project.Name,
		Description: project.Description,
		WorkspaceID: project.WorkspaceID,
	}

	c.JSON(http.StatusCreated, response)
}

func (h *ProjectHandler) GetProjects(
	c *gin.Context,
) {

	userID := c.MustGet("userID").(uint)

	projects, err := h.projectService.GetProjects(
		userID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch projects",
		})
		return
	}

	var response []dto.ProjectResponse

	for _, project := range projects {
		response = append(response, dto.ProjectResponse{
			ID:          project.ID,
			Name:        project.Name,
			Description: project.Description,
			WorkspaceID: project.WorkspaceID,
		})
	}

	c.JSON(http.StatusOK, response)
}

func (h *ProjectHandler) GetProjectByID(
	c *gin.Context,
) {

	userID := c.MustGet("userID").(uint)

	idParam := c.Param("id")

	projectID, err := strconv.ParseUint(
		idParam,
		10,
		64,
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid project id",
		})
		return
	}

	project, err := h.projectService.GetProjectByID(
		uint(projectID),
		userID,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "project not found",
		})
		return
	}

	response := dto.ProjectResponse{
		ID:          project.ID,
		Name:        project.Name,
		Description: project.Description,
		WorkspaceID: project.WorkspaceID,
	}

	c.JSON(http.StatusOK, response)
}