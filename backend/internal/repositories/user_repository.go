package repositories

import (
	"github.com/ShashankShekhar9839/rationale/internal/db"
	"github.com/ShashankShekhar9839/rationale/internal/models"
)

func CreateUser(user *models.User) error {

	result := db.DB.Create(user)

	return result.Error
}

func GetUsers() ([]models.User, error) {

	var users []models.User

	result := db.DB.Find(&users)

	return users, result.Error
}

func GetUserByID(id string) (models.User, error) {

	var user models.User

	result := db.DB.First(&user, id)

	return user, result.Error
}

func GetUserByEmail(email string) (models.User, error) {

	var user models.User

	result := db.DB.Where("email = ?", email).First(&user)

	return user, result.Error
}


func GetUserByUintID(id uint) (models.User, error) {

	var user models.User

	result := db.DB.First(&user, id)

	return user, result.Error
}