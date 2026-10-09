package http

import (
	"github.com/gofiber/fiber/v2"

	shopsusecase "github.com/prakasa1904/ai-commerce/internal/features/shop/usecase"
	usersusecase "github.com/prakasa1904/ai-commerce/internal/features/user/usecase"
	platformvalidator "github.com/prakasa1904/ai-commerce/internal/platform/validator"
	"github.com/prakasa1904/ai-commerce/internal/shared/jwt"
	"github.com/prakasa1904/ai-commerce/internal/shared/middleware"

	"go.uber.org/zap"
)

// NewUserAuthHandler builds the auth delivery handler from framework types.
func NewUserAuthHandler(
	users *usersusecase.UserUsecase,
	shopUsecase *shopsusecase.ShopUsecase,
	validator *platformvalidator.Validator,
	logger *zap.Logger,
) *UserAuthHandler {
	v := validatorAdapter{validate: validator}
	return &UserAuthHandler{users: users, meShops: shopUsecase, validator: v, logger: logger}
}

// NewUserAdminHandler builds the admin user handler from framework types.
func NewUserAdminHandler(users *usersusecase.UserUsecase, validator *platformvalidator.Validator) *UserAdminHandler {
	return &UserAdminHandler{users: users, validator: validatorAdapter{validate: validator}}
}

// RegisterAuthRoutes mounts the public auth endpoints under /api/auth.
func RegisterAuthRoutes(app *fiber.App, auth *UserAuthHandler, signer *jwt.Signer) {
	group := app.Group("/api/auth")
	group.Post("/register", auth.Register)
	group.Post("/login", auth.Login)
	group.Get("/me", middleware.AuthMiddleware(signer), auth.Me)
}

// RegisterUserAdminRoutes mounts the platform-admin user CRUD under
// /api/admin/users.
func RegisterUserAdminRoutes(app *fiber.App, handler *UserAdminHandler, signer *jwt.Signer) {
	group := app.Group("/api/admin/users", middleware.AuthMiddleware(signer))
	group.Get("/", handler.ListUsers)
	group.Post("/", handler.CreateUser)
	group.Get("/:id", handler.GetUser)
	group.Patch("/:id", handler.UpdateUser)
	group.Delete("/:id", handler.DeleteUser)
	group.Post("/:id/restore", handler.RestoreUser)
}

// validatorAdapter bridges the platform validator to the handler seam.
type validatorAdapter struct {
	validate *platformvalidator.Validator
}

func (v validatorAdapter) ValidateStruct(s any) error {
	return v.validate.ValidateStruct(s)
}
