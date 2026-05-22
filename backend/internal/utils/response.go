package utils

import "github.com/gin-gonic/gin"

func SuccessResponse(
	c *gin.Context,
	statusCode int,
	message string,
	data interface{},
) {

	c.JSON(statusCode, gin.H{
		"success": true,
		"message": message,
		"data":    data,
	})
}

func ErrorResponse(
	c *gin.Context,
	statusCode int,
	errorMessage string,
) {

	c.JSON(statusCode, gin.H{
		"success": false,
		"error":   errorMessage,
	})
}