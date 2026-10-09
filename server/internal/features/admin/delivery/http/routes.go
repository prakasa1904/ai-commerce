package http

import (
	"github.com/gofiber/fiber/v2"

	"github.com/prakasa1904/ai-commerce/internal/features/admin/usecase"
	"github.com/prakasa1904/ai-commerce/internal/shared/jwt"
	"github.com/prakasa1904/ai-commerce/internal/shared/middleware"
)

// NewAdminStatsHandlerFromCollector builds the admin stats handler from a
// StatisticsCollector.
func NewAdminStatsHandlerFromCollector(collector usecase.StatisticsCollector) *AdminStatsHandler {
	return NewAdminStatsHandler(collector)
}

// RegisterAdminRoutes mounts the admin endpoint under /api/admin.
func RegisterAdminRoutes(app *fiber.App, collector usecase.StatisticsCollector, signer *jwt.Signer) {
	group := app.Group("/api/admin", middleware.AuthMiddleware(signer))
	group.Get("/stats", NewAdminStatsHandler(collector).Stats)
}
