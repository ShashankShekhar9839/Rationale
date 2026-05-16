package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {

	// Load .env file
	err := godotenv.Load()

	if err != nil {
		log.Println("No .env file found")
	}

	// Create gin router
	router := gin.Default()

	// Test route
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Server is running",
		})
	})

	// Get port from env
	port := os.Getenv("PORT")

	if port == "" {
		port = "8080"
	}

	log.Println("Server running on port", port)

	// Start server
	router.Run(":" + port)
}