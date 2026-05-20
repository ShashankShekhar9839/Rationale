package services

import (
	"errors"

	"github.com/ShashankShekhar9839/rationale/internal/models"
	"github.com/ShashankShekhar9839/rationale/internal/repositories"
	"github.com/ShashankShekhar9839/rationale/internal/utils"
)

func CreateUser(user *models.User) error {

	existingUser, _ := repositories.GetUserByEmail(user.Email)

	if existingUser.ID != 0 {
		return errors.New("email already exists")
	}

	// Hash password before saving
	hashedPassword, err := utils.HashPassword(user.Password)

	if err != nil {
		return err
	}

	user.Password = hashedPassword

	return repositories.CreateUser(user)
}

func GetUsers() ([]models.User, error) {
	return repositories.GetUsers()
}

func GetUserByID(id string) (models.User, error) {
	return repositories.GetUserByID(id)
}

func LoginUser(email, password string) (string, error) {

	user, err := repositories.GetUserByEmail(email)

	if err != nil {
		return "", errors.New("invalid credentials")
	}

	isValidPassword := utils.CheckPasswordHash(
		password,
		user.Password,
	)

	if !isValidPassword {
		return "", errors.New("invalid credentials")
	}

	token, err := utils.GenerateJWT(user.ID)

	if err != nil {
		return "", err
	}

	return token, nil
}