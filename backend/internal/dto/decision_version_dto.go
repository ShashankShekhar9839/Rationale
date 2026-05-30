package dto

import (
	"time"
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
}

type DecisionVersionHistoryResponse struct {
	ID            uint      `json:"id"`
	VersionNumber uint      `json:"version_number"`
	Label         string    `json:"label"`
	CreatedAt     time.Time `json:"created_at"`
}