package dto

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
}