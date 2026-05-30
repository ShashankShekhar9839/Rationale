package dto

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
}