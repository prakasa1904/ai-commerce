// Package middleware holds HTTP-level cross-cutting concerns.
package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"

	sharederrors "github.com/prakasa1904/ai-commerce/internal/shared/errors"
	"github.com/prakasa1904/ai-commerce/internal/shared/jwt"
)

// AuthMiddleware returns a Fiber middleware that verifies Bearer tokens and
// stores the claims in the request context.
func AuthMiddleware(signer *jwt.Signer) func(*fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		header := c.Get("Authorization", "")
		if !strings.HasPrefix(header, "Bearer ") {
			return sharederrors.ErrUnauthenticated
		}

		claims, err := signer.Parse(strings.TrimPrefix(header, "Bearer "))
		if err != nil {
			return sharederrors.ErrInvalidToken
		}

		c.Locals("user", claims)
		return c.Next()
	}
}

// ClaimsFrom extracts the verified claims stored by AuthMiddleware.
func ClaimsFrom(c *fiber.Ctx) *jwt.Claims {
	if claims, ok := c.Locals("user").(*jwt.Claims); ok {
		return claims
	}
	return &jwt.Claims{}
}
