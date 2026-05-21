package user

import (
	"net/http"

	"github.com/ShashankShekhar9839/rationale/internal/dto"
	"github.com/ShashankShekhar9839/rationale/internal/models"
	"github.com/ShashankShekhar9839/rationale/internal/services"

	"github.com/gin-gonic/gin"
)

func CreateUser(c *gin.Context) {

	var user models.User

	err := c.ShouldBindJSON(&user)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	err = services.CreateUser(&user)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User created successfully",
		"data":    dto.ToUserResponse(user),
	})
}

func GetUsers(c *gin.Context) {

	users, err := services.GetUsers()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": dto.ToUserResponseList(users),
	})
}

func GetUserByID(c *gin.Context) {

	id := c.Param("id")

	user, err := services.GetUserByID(id)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": dto.ToUserResponse(user),
	})
}

func LoginUser(c *gin.Context) {

	var request dto.LoginRequest

	err := c.ShouldBindJSON(&request)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	token, err := services.LoginUser(
		request.Email,
		request.Password,
	)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
	})
}

func GetCurrentUser(c *gin.Context) {

	userIDValue, exists := c.Get("user_id")

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not authenticated",
		})

		return
	}

	// JWT stores numbers as float64
	userID := uint(userIDValue.(float64))

	user, err := services.GetCurrentUser(userID)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": dto.ToUserResponse(user),
	})
}