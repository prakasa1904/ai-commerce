package http

import (
	"context"

	"github.com/gofiber/fiber/v2"
	"github.com/prakasa1904/ai-commerce/internal/shared/jwt"
	"github.com/prakasa1904/ai-commerce/internal/shared/middleware"
)

// validator is the minimal seam the handler needs for payload validation.
type validator interface {
	ValidateStruct(any) error
}

// claimsFrom extracts the verified claims stored by AuthMiddleware.
func claimsFrom(c *fiber.Ctx) *jwt.Claims {
	return middleware.ClaimsFrom(c)
}

// writeError maps a message to a safe error envelope.
func writeError(c *fiber.Ctx, message string, status int) error {
	return c.Status(status).JSON(map[string]string{"error": message})
}

var _ = context.Background
