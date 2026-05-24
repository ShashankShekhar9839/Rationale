package main

import (
	"github.com/ShashankShekhar9839/rationale/internal/config"
	"github.com/ShashankShekhar9839/rationale/internal/db"
	"github.com/ShashankShekhar9839/rationale/internal/handlers"
	"github.com/ShashankShekhar9839/rationale/internal/middleware"
	"github.com/ShashankShekhar9839/rationale/internal/repositories"
	"github.com/ShashankShekhar9839/rationale/internal/services"
	"github.com/ShashankShekhar9839/rationale/internal/user"

	"github.com/gin-gonic/gin"
)

func main() {

	config.LoadConfig()

	db.ConnectDatabase()

	// Workspace dependency injection
	workspaceRepo := repositories.NewWorkspaceRepository(db.DB)
	workspaceService := services.NewWorkspaceService(
		workspaceRepo,
	)
	workspaceHandler := handlers.NewWorkspaceHandler(
		workspaceService,
	)

	router := gin.Default()

	// API Group
	api := router.Group("/api")

	// Auth Routes
	authRoutes := api.Group("/auth")

	{
		authRoutes.POST(
			"/register",
			user.CreateUser,
		)

		authRoutes.POST(
			"/login",
			user.LoginUser,
		)
	}

	// Protected Routes
	protected := api.Group("/")

	protected.Use(
		middleware.AuthMiddleware(),
	)

	{
		protected.GET(
			"/users",
			user.GetUsers,
		)

		protected.GET(
			"/users/:id",
			user.GetUserByID,
		)

		protected.GET(
			"/me",
			user.GetCurrentUser,
		)
	}

	// Organization Routes
	organizationRoutes := api.Group("/organizations")

	organizationRoutes.Use(
		middleware.AuthMiddleware(),
	)

	{
		organizationRoutes.POST(
			"",
			handlers.CreateOrganization,
		)

		organizationRoutes.GET(
			"",
			handlers.GetOrganizations,
		)

		organizationRoutes.GET(
			"/:id",
			handlers.GetOrganizationByID,
		)
	}

	// Workspace Routes
workspaceRoutes := api.Group("/workspaces")

workspaceRoutes.Use(
	middleware.AuthMiddleware(),
)

{
	workspaceRoutes.POST(
		"",
		workspaceHandler.CreateWorkspace,
	)
}

	// Run Server
	router.Run(":" + config.AppConfig.ServerPort)
}