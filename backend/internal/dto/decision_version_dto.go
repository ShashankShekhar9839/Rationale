package dto

import (
	"time"

	"github.com/ShashankShekhar9839/rationale/internal/models"
)

type CreateDecisionVersionRequest struct {
	Label   string `json:"label" binding:"required"`
	Content string `json:"content"`
}

type DecisionVersionResponse struct {
	ID            uint   `json:"id"`
	VersionNumber uint   `json:"version_number"`
	Label         string `json:"label"`
	Content       string `json:"content"`
	DecisionID    uint   `json:"decision_id"`
	AuditResponse
}

type DecisionVersionHistoryResponse struct {
	ID            uint               `json:"id"`
	VersionNumber uint               `json:"version_number"`
	Label         string             `json:"label"`
	CreatedAt     time.Time          `json:"created_at"`
	UpdatedAt     time.Time          `json:"updated_at"`
	CreatedBy     *AuditUserResponse `json:"created_by"`
	UpdatedBy     *AuditUserResponse `json:"updated_by"`
}

func ToDecisionVersionResponse(version models.DecisionVersion) DecisionVersionResponse {
	return DecisionVersionResponse{
		ID:            version.ID,
		VersionNumber: version.VersionNumber,
		Label:         version.Label,
		Content:       version.Content,
		DecisionID:    version.DecisionID,
		AuditResponse: ToAuditResponse(
			version.CreatedAt,
			version.UpdatedAt,
			version.CreatedBy,
			version.UpdatedBy,
		),
	}
}

func ToDecisionVersionHistoryResponse(
	version models.DecisionVersion,
) DecisionVersionHistoryResponse {
	return DecisionVersionHistoryResponse{
		ID:            version.ID,
		VersionNumber: version.VersionNumber,
		Label:         version.Label,
		CreatedAt:     version.CreatedAt,
		UpdatedAt:     version.UpdatedAt,
		CreatedBy:     ToAuditUserResponse(version.CreatedBy),
		UpdatedBy:     ToAuditUserResponse(version.UpdatedBy),
	}
}

func ToDecisionVersionHistoryResponseList(
	versions []models.DecisionVersion,
) []DecisionVersionHistoryResponse {
	response := make([]DecisionVersionHistoryResponse, 0, len(versions))
	for _, version := range versions {
		response = append(response, ToDecisionVersionHistoryResponse(version))
	}
	return response
}
