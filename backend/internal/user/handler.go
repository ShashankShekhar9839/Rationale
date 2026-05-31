package user

import (
	"net/http"

	"github.com/ShashankShekhar9839/rationale/internal/dto"
	"github.com/ShashankShekhar9839/rationale/internal/models"
	"github.com/ShashankShekhar9839/rationale/internal/services"
	"github.com/ShashankShekhar9839/rationale/internal/utils"

	"github.com/gin-gonic/gin"
)

func CreateUser(c *gin.Context) {

	var request dto.CreateUserRequest

	err := c.ShouldBindJSON(&request)

	if err != nil {
		utils.ErrorResponse(
			c,
			http.StatusBadRequest,
			err.Error(),
		)
		return
	}

	user := models.User{
		Name:     request.Name,
		Email:    request.Email,
		Password: request.Password,
	}

	err = services.CreateUser(&user)

	if err != nil {
		utils.ErrorResponse(
			c,
			http.StatusBadRequest,
			err.Error(),
		)
		return
	}

	utils.SuccessResponse(
		c,
		http.StatusCreated,
		"User created successfully",
		dto.ToUserResponse(user),
	)
}

func GetUsers(c *gin.Context) {

	users, err := services.GetUsers()

	if err != nil {
		utils.ErrorResponse(
			c,
			http.StatusInternalServerError,
			err.Error(),
		)
		return
	}

	utils.SuccessResponse(
		c,
		http.StatusOK,
		"Users fetched successfully",
		dto.ToUserResponseList(users),
	)
}

func GetUserByID(c *gin.Context) {

	id := c.Param("id")

	user, err := services.GetUserByID(id)

	if err != nil {
		utils.ErrorResponse(
			c,
			http.StatusNotFound,
			"User not found",
		)
		return
	}

	utils.SuccessResponse(
		c,
		http.StatusOK,
		"User fetched successfully",
		dto.ToUserResponse(user),
	)
}

func LoginUser(c *gin.Context) {

	var request dto.LoginRequest

	err := c.ShouldBindJSON(&request)

	if err != nil {
		utils.ErrorResponse(
			c,
			http.StatusBadRequest,
			err.Error(),
		)
		return
	}

	token, loggedInUser, err := services.LoginUser(
		request.Email,
		request.Password,
	)

	if err != nil {
		utils.ErrorResponse(
			c,
			http.StatusUnauthorized,
			err.Error(),
		)
		return
	}

	utils.SuccessResponse(
		c,
		http.StatusOK,
		"Login successful",
		gin.H{
			"token": token,
			"user":  dto.ToUserResponse(loggedInUser),
		},
	)
}

func GetCurrentUser(c *gin.Context) {

	userIDValue, exists := c.Get("userID")

	if !exists {
		utils.ErrorResponse(
			c,
			http.StatusUnauthorized,
			"User not authenticated",
		)
		return
	}

	userID := userIDValue.(uint)

	user, err := services.GetCurrentUser(userID)

	if err != nil {
		utils.ErrorResponse(
			c,
			http.StatusNotFound,
			"User not found",
		)
		return
	}

	utils.SuccessResponse(
		c,
		http.StatusOK,
		"Current user fetched successfully",
		dto.ToUserResponse(user),
	)
}
