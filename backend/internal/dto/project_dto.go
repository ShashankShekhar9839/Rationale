package dto

import "github.com/ShashankShekhar9839/rationale/internal/models"

type CreateProjectRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	WorkspaceID uint   `json:"workspace_id" binding:"required"`
}

type ProjectResponse struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	WorkspaceID uint   `json:"workspace_id"`
	AuditResponse
}

func ToProjectResponse(project models.Project) ProjectResponse {
	return ProjectResponse{
		ID:          project.ID,
		Name:        project.Name,
		Description: project.Description,
		WorkspaceID: project.WorkspaceID,
		AuditResponse: ToAuditResponse(
			project.CreatedAt,
			project.UpdatedAt,
			project.CreatedBy,
			project.UpdatedBy,
		),
	}
}

func ToProjectResponseList(projects []models.Project) []ProjectResponse {
	response := make([]ProjectResponse, 0, len(projects))
	for _, project := range projects {
		response = append(response, ToProjectResponse(project))
	}
	return response
}
