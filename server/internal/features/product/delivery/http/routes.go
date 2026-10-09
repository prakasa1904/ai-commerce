package http

import (
	"github.com/gofiber/fiber/v2"

	productusecase "github.com/prakasa1904/ai-commerce/internal/features/product/usecase"
	platformvalidator "github.com/prakasa1904/ai-commerce/internal/platform/validator"
	"github.com/prakasa1904/ai-commerce/internal/shared/jwt"
	"github.com/prakasa1904/ai-commerce/internal/shared/middleware"
)

// NewProductHandler builds the product HTTP handler from framework types.
func NewProductHandler(products *productusecase.ProductUsecase, validator *platformvalidator.Validator) *ProductHandler {
	return &ProductHandler{products: products, validator: validatorAdapter{validate: validator}}
}

// validatorAdapter bridges the platform validator to the handler seam.
type validatorAdapter struct {
	validate *platformvalidator.Validator
}

func (v validatorAdapter) ValidateStruct(s any) error {
	return v.validate.ValidateStruct(s)
}

// RegisterPublicRoutes mounts the public catalog endpoint.
func RegisterPublicRoutes(app *fiber.App, handler *ProductHandler) {
	app.Get("/api/products", handler.ListPublic)
	app.Get("/api/cart", func(c *fiber.Ctx) error {
		return c.JSON(map[string]any{"items": []any{}})
	})
}

// RegisterProductAdminRoutes mounts the admin product management endpoints
// under /api/admin/products.
func RegisterProductAdminRoutes(app *fiber.App, handler *ProductHandler, signer *jwt.Signer) {
	group := app.Group("/api/admin/products", middleware.AuthMiddleware(signer))

	group.Get("/", handler.ListAdmin)
	group.Post("/", handler.CreateAdmin)
	group.Get("/:id", handler.GetAdmin)
	group.Get("/:id/shops", handler.ListProductShops)
	group.Patch("/:id", handler.UpdateAdmin)
	group.Delete("/:id", handler.DeleteAdmin)
	group.Post("/:id/restore", handler.RestoreAdmin)

	group.Post("/:id/shops", handler.LinkProductToShop)
	group.Delete("/:id/shops/:shopId", handler.UnlinkProductFromShop)
}
