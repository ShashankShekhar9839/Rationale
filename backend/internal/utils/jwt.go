package utils

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateJWT(userID uint) (string, error) {

	secret := os.Getenv("JWT_SECRET")

	token := jwt.NewWithClaims(
		jwt.SigningMethodHS256,
		jwt.MapClaims{
			"user_id": userID,
			"exp":     time.Now().Add(time.Hour * 24).Unix(),
		},
	)

	tokenString, err := token.SignedString([]byte(secret))

	return tokenString, err
}