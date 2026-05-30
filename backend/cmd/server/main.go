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

	// Decision
decisionRepo := repositories.NewDecisionRepository(
	db.DB,
)

decisionService := services.NewDecisionService(
	decisionRepo,
)

decisionHandler := handlers.NewDecisionHandler(
	decisionService,
)

// Decision Version
decisionVersionRepo := repositories.NewDecisionVersionRepository(
	db.DB,
)

decisionVersionService := services.NewDecisionVersionService(
	decisionVersionRepo,
)

decisionVersionHandler := handlers.NewDecisionVersionHandler(
	decisionVersionService,
)

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

	workspaceRoutes.GET(
	"",
	workspaceHandler.GetWorkspaces,
)
workspaceRoutes.GET(
	"/:id",
	workspaceHandler.GetWorkspaceByID,
)
   }

//    project routes

projectRepo := repositories.NewProjectRepository(db.DB)

projectService := services.NewProjectService(
	projectRepo,
)

projectHandler := handlers.NewProjectHandler(
	projectService,
)

projectRoutes := api.Group("/projects")

projectRoutes.Use(
	middleware.AuthMiddleware(),
)

{
	projectRoutes.POST(
		"",
		projectHandler.CreateProject,
	)

	projectRoutes.GET(
		"",
		projectHandler.GetProjects,
	)

	projectRoutes.GET(
		"/:id",
		projectHandler.GetProjectByID,
	)

	projectRoutes.GET(
		"/:id/decisions",
		decisionHandler.GetDecisionsByProjectID,
	)
}

// // decision 

//   decisionRepo := repositories.NewDecisionRepository(
// 	db.DB,
// )

// decisionService := services.NewDecisionService(
// 	decisionRepo,
// )

// decisionHandler := handlers.NewDecisionHandler(
// 	decisionService,
// )

decisionRoutes := api.Group("/decisions")

decisionRoutes.Use(
	middleware.AuthMiddleware(),
)

{
	decisionRoutes.POST(
		"",
		decisionHandler.CreateDecision,
	)
}

// //    decision version 

//    decisionVersionRepo := repositories.NewDecisionVersionRepository(
// 	db.DB,
// )

// decisionVersionService := services.NewDecisionVersionService(
// 	decisionVersionRepo,
// )

// decisionVersionHandler := handlers.NewDecisionVersionHandler(
// 	decisionVersionService,
// )
{
decisionRoutes := api.Group("/decisions")
decisionRoutes.Use(
	middleware.AuthMiddleware(),
) 


	decisionRoutes.POST(
	"/:id/versions",
	decisionVersionHandler.CreateVersion,
)

decisionRoutes.GET(
	"/:id/versions",
	decisionVersionHandler.GetVersionsByDecisionID,
)
}

versionRoutes := api.Group("/decision-versions")

versionRoutes.Use(
	middleware.AuthMiddleware(),
)

{
	versionRoutes.GET(
		"/:id",
		decisionVersionHandler.GetVersionByID,
	)
}

	// Run Server
	router.Run(":" + config.AppConfig.ServerPort)
}