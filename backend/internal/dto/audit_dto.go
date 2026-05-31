package dto

import (
	"time"

	"github.com/ShashankShekhar9839/rationale/internal/models"
)

type AuditUserResponse struct {
	ID    uint   `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

type AuditResponse struct {
	CreatedAt time.Time          `json:"created_at"`
	UpdatedAt time.Time          `json:"updated_at"`
	CreatedBy *AuditUserResponse `json:"created_by"`
	UpdatedBy *AuditUserResponse `json:"updated_by"`
}

func ToAuditUserResponse(user models.User) *AuditUserResponse {
	if user.ID == 0 {
		return nil
	}

	return &AuditUserResponse{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
	}
}

func ToAuditResponse(
	createdAt time.Time,
	updatedAt time.Time,
	createdBy models.User,
	updatedBy models.User,
) AuditResponse {
	return AuditResponse{
		CreatedAt: createdAt,
		UpdatedAt: updatedAt,
		CreatedBy: ToAuditUserResponse(createdBy),
		UpdatedBy: ToAuditUserResponse(updatedBy),
	}
}
