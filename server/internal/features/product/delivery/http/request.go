package http

import (
	"github.com/gofiber/fiber/v2"

	"github.com/prakasa1904/ai-commerce/internal/features/product/domain"
	"github.com/prakasa1904/ai-commerce/internal/shared/jwt"
	"github.com/prakasa1904/ai-commerce/internal/shared/middleware"
)

// CreateProductRequest is the validated admin product creation payload.
type CreateProductRequest struct {
	Title       string `json:"title" validate:"required,min=2,max=200"`
	Description string `json:"description" validate:"max=1000"`
	Price       int64  `json:"price" validate:"min=0"`
	ImageURL    string `json:"imageUrl" validate:"max=500"`
	Category    string `json:"category" validate:"max=100"`
	Unit        string `json:"unit" validate:"max=50"`
	Stock       int    `json:"stock" validate:"min=0"`
	Wholesale   bool   `json:"wholesale"`
}

// UpdateProductRequest carries optional, partial product changes.
type UpdateProductRequest struct {
	Title       *string `json:"title" validate:"omitempty,min=2,max=200"`
	Description *string `json:"description" validate:"omitempty,max=1000"`
	Price       *int64  `json:"price" validate:"omitempty,min=0"`
	ImageURL    *string `json:"imageUrl" validate:"omitempty,max=500"`
	Category    *string `json:"category" validate:"omitempty,max=100"`
	Unit        *string `json:"unit" validate:"omitempty,max=50"`
	Stock       *int    `json:"stock" validate:"omitempty,min=0"`
	Wholesale   *bool   `json:"wholesale"`
}

// LinkProductRequest is the payload for linking a product to a shop.
type LinkProductRequest struct {
	ShopID int64  `json:"shopId" validate:"required,min=1"`
	Price  *int64 `json:"price"`
	Stock  int    `json:"stock"`
}

// validator is the minimal seam the handler needs for payload validation.
type validator interface {
	ValidateStruct(any) error
}

// claimsFrom extracts the authenticated actor claims from the request context.
func claimsFrom(c *fiber.Ctx) *jwt.Claims {
	return middleware.ClaimsFrom(c)
}

// writeError maps a message to a safe error envelope.
func writeError(c *fiber.Ctx, message string, status int) error {
	return c.Status(status).JSON(map[string]string{"error": message})
}

var _ = domain.Product{}
