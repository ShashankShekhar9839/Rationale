package dto

import "github.com/ShashankShekhar9839/rationale/internal/models"

type CreateDecisionRequest struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
	ProjectID   uint   `json:"project_id" binding:"required"`
}

type DecisionResponse struct {
	ID          uint   `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	ProjectID   uint   `json:"project_id"`
}

type DecisionDetailsResponse struct {
    ID            uint                     `json:"id"`
    Title         string                   `json:"title"`
    Description   string                   `json:"description"`
    ProjectID     uint                     `json:"project_id"`
    LatestVersion *models.DecisionVersion  `json:"latest_version"`
}


type UpdateVersionRequest struct {
    Label   string `json:"label"`
    Content string `json:"content"`
}