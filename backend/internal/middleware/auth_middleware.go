package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {

	return func(c *gin.Context) {

		authHeader := c.GetHeader("Authorization")

		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authorization header missing",
			})

			c.Abort()
			return
		}

		// Expected format:
		// Bearer TOKEN

		tokenParts := strings.Split(authHeader, " ")

		if len(tokenParts) != 2 {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid authorization format",
			})

			c.Abort()
			return
		}

		tokenString := tokenParts[1]

		secret := os.Getenv("JWT_SECRET")

		token, err := jwt.Parse(
			tokenString,
			func(token *jwt.Token) (interface{}, error) {
				return []byte(secret), nil
			},
		)

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid token",
			})

			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)

		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid token claims",
			})

			c.Abort()
			return
		}

		userID := claims["user_id"]

		// Store user info in request context
		c.Set("user_id", userID)

		c.Next()
	}
}