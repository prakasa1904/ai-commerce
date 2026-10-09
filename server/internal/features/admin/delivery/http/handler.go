package http

import (
	"github.com/gofiber/fiber/v2"

	"github.com/prakasa1904/ai-commerce/internal/features/admin/usecase"
)

// AdminStatsHandler serves the admin dashboard counts.
type AdminStatsHandler struct {
	stats usecase.StatisticsCollector
}

// NewAdminStatsHandler assembles the admin stats handler.
func NewAdminStatsHandler(stats usecase.StatisticsCollector) *AdminStatsHandler {
	return &AdminStatsHandler{stats: stats}
}

// Stats returns the counts snapshot.
func (h *AdminStatsHandler) Stats(c *fiber.Ctx) error {
	result, err := h.stats.Collect(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(map[string]string{"error": err.Error()})
	}
	return c.JSON(result)
}
