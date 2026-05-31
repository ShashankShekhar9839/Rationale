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
	AuditResponse
}

type DecisionDetailsResponse struct {
	ID            uint                     `json:"id"`
	Title         string                   `json:"title"`
	Description   string                   `json:"description"`
	ProjectID     uint                     `json:"project_id"`
	LatestVersion *DecisionVersionResponse `json:"latest_version"`
	AuditResponse
}

func ToDecisionResponse(decision models.Decision) DecisionResponse {
	return DecisionResponse{
		ID:          decision.ID,
		Title:       decision.Title,
		Description: decision.Description,
		ProjectID:   decision.ProjectID,
		AuditResponse: ToAuditResponse(
			decision.CreatedAt,
			decision.UpdatedAt,
			decision.CreatedBy,
			decision.UpdatedBy,
		),
	}
}

func ToDecisionResponseList(decisions []models.Decision) []DecisionResponse {
	response := make([]DecisionResponse, 0, len(decisions))
	for _, decision := range decisions {
		response = append(response, ToDecisionResponse(decision))
	}
	return response
}

func ToDecisionDetailsResponse(
	decision models.Decision,
	latestVersion *models.DecisionVersion,
) DecisionDetailsResponse {
	var versionResponse *DecisionVersionResponse
	if latestVersion != nil {
		versionResponseValue := ToDecisionVersionResponse(*latestVersion)
		versionResponse = &versionResponseValue
	}

	return DecisionDetailsResponse{
		ID:            decision.ID,
		Title:         decision.Title,
		Description:   decision.Description,
		ProjectID:     decision.ProjectID,
		LatestVersion: versionResponse,
		AuditResponse: ToAuditResponse(
			decision.CreatedAt,
			decision.UpdatedAt,
			decision.CreatedBy,
			decision.UpdatedBy,
		),
	}
}

type UpdateVersionRequest struct {
	Label   string `json:"label"`
	Content string `json:"content"`
}
