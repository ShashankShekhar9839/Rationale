package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"github.com/ShashankShekhar9839/rationale/internal/db"
	"github.com/ShashankShekhar9839/rationale/internal/middleware"
	"github.com/ShashankShekhar9839/rationale/internal/user"
)

func main() {

	err := godotenv.Load()

	if err != nil {
		log.Println("No .env file found")
	}

	// Connect database
	db.ConnectDatabase()

	router := gin.Default()  // this line creates a gin server 

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Server running",
		})
	})

	router.POST("/login", user.LoginUser)

	// user routes 

	router.POST("/users", user.CreateUser)
    router.GET(
	"/users",
	middleware.AuthMiddleware(),
	user.GetUsers,
    )

    router.GET(
	"/users/:id",
	middleware.AuthMiddleware(),
	user.GetUserByID,
    )

	router.GET(
	"/me",
	middleware.AuthMiddleware(),
	user.GetCurrentUser,
    )


	port := os.Getenv("PORT")

	if port == "" {
		port = "8080"
	}

	log.Println("Server running on port", port)

	router.Run(":" + port)
}