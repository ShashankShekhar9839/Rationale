package dto

import (
	"time"

	"github.com/ShashankShekhar9839/rationale/internal/models"
)

type UserResponse struct {
	ID        uint
	Name      string
	Email     string
	CreatedAt time.Time
	UpdatedAt time.Time
}


type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func ToUserResponse(user models.User) UserResponse {

	return UserResponse{
		ID:        user.ID,
		Name:      user.Name,
		Email:     user.Email,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}
}

func ToUserResponseList(users []models.User) []UserResponse {

	var response []UserResponse

	for _, user := range users {
		response = append(response, ToUserResponse(user))
	}

	return response
}