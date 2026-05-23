package main

import (
	"github.com/ShashankShekhar9839/rationale/internal/config"
	"github.com/ShashankShekhar9839/rationale/internal/db"
	"github.com/ShashankShekhar9839/rationale/internal/middleware"
	"github.com/ShashankShekhar9839/rationale/internal/models"
	"github.com/ShashankShekhar9839/rationale/internal/user"

	"github.com/gin-gonic/gin"
)

func main() {

	config.LoadConfig()

	db.ConnectDatabase()


	router := gin.Default()

	// Public Routes
	router.POST("/users", user.CreateUser)
	router.POST("/login", user.LoginUser)

	// Protected Routes Group
	protected := router.Group("/")

	protected.Use(middleware.AuthMiddleware())

	protected.GET("/users", user.GetUsers)
	protected.GET("/users/:id", user.GetUserByID)
	protected.GET("/me", user.GetCurrentUser)

	router.Run(":" + config.AppConfig.ServerPort)
}