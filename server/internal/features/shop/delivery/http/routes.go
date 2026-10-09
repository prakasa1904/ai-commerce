package http

import (
	"github.com/gofiber/fiber/v2"

	shopsusecase "github.com/prakasa1904/ai-commerce/internal/features/shop/usecase"
	platformvalidator "github.com/prakasa1904/ai-commerce/internal/platform/validator"
	"github.com/prakasa1904/ai-commerce/internal/shared/jwt"
	"github.com/prakasa1904/ai-commerce/internal/shared/middleware"
)

// NewShopAdminHandler builds the shop admin handler from framework types.
func NewShopAdminHandler(shops *shopsusecase.ShopUsecase, validator *platformvalidator.Validator) *ShopAdminHandler {
	return &ShopAdminHandler{shops: shops, validator: validatorAdapter{validate: validator}}
}

// validatorAdapter bridges the platform validator to the handler seam.
type validatorAdapter struct {
	validate *platformvalidator.Validator
}

func (v validatorAdapter) ValidateStruct(s any) error {
	return v.validate.ValidateStruct(s)
}

// RegisterShopAdminRoutes mounts the shop management endpoints under
// /api/admin/shops.
func RegisterShopAdminRoutes(app *fiber.App, handler *ShopAdminHandler, signer *jwt.Signer) {
	group := app.Group("/api/admin/shops", middleware.AuthMiddleware(signer))

	group.Get("/", handler.ListShops)
	group.Post("/", handler.CreateShop)
	group.Get("/:id", handler.GetShop)
	group.Patch("/:id", handler.UpdateShop)
	group.Delete("/:id", handler.DeleteShop)
	group.Post("/:id/restore", handler.RestoreShop)

	members := group.Group("/:id/members")
	members.Get("/", handler.ListMembers)
	members.Post("/", handler.AddMember)
	members.Patch("/:userId", handler.UpdateMember)
	members.Delete("/:userId", handler.RemoveMember)

	products := group.Group("/:id/products")
	products.Get("/", handler.ListShopProducts)
}
