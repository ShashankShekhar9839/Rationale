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

	c.JSON(http.StatusCreated, dto.ToProjectResponse(*project))
}

func (h *ProjectHandler) GetProjects(
	c *gin.Context,
) {

	userID := c.MustGet("userID").(uint)

	workspaceIDParam := c.Query("workspace_id")

	projectModels, err := h.projectService.GetProjects(userID)

	if workspaceIDParam != "" {
		workspaceID, parseErr := strconv.ParseUint(
			workspaceIDParam,
			10,
			64,
		)

		if parseErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "invalid workspace id",
			})
			return
		}

		projectModels, err = h.projectService.GetProjectsByWorkspaceID(
			uint(workspaceID),
			userID,
		)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to fetch projects",
		})
		return
	}

	c.JSON(http.StatusOK, dto.ToProjectResponseList(projectModels))
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

	c.JSON(http.StatusOK, dto.ToProjectResponse(*project))
}
