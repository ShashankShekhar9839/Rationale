package dto

import "github.com/ShashankShekhar9839/rationale/internal/models"

type CreateWorkspaceRequest struct {
	Name           string `json:"name" binding:"required"`
	Description    string `json:"description"`
	OrganizationID uint   `json:"organization_id" binding:"required"`
}

type WorkspaceResponse struct {
	ID             uint   `json:"id"`
	Name           string `json:"name"`
	Description    string `json:"description"`
	OrganizationID uint   `json:"organization_id"`
	AuditResponse
}

func ToWorkspaceResponse(workspace models.Workspace) WorkspaceResponse {
	return WorkspaceResponse{
		ID:             workspace.ID,
		Name:           workspace.Name,
		Description:    workspace.Description,
		OrganizationID: workspace.OrganizationID,
		AuditResponse: ToAuditResponse(
			workspace.CreatedAt,
			workspace.UpdatedAt,
			workspace.CreatedBy,
			workspace.UpdatedBy,
		),
	}
}

func ToWorkspaceResponseList(workspaces []models.Workspace) []WorkspaceResponse {
	response := make([]WorkspaceResponse, 0, len(workspaces))
	for _, workspace := range workspaces {
		response = append(response, ToWorkspaceResponse(workspace))
	}
	return response
}
