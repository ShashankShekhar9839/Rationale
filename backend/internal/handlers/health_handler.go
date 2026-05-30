package handlers

import (
	"github.com/ShashankShekhar9839/rationale/internal/utils"
	"github.com/gin-gonic/gin"
)

// Health returns a simple OK status for health checks
func Health(c *gin.Context) {
    utils.SuccessResponse(c, 200, "ok", gin.H{"status": "ok"})
}
