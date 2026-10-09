package http

import (
	"errors"
	"strings"

	"github.com/gofiber/fiber/v2"

	shopsusecase "github.com/prakasa1904/ai-commerce/internal/features/shop/usecase"
	usersdomain "github.com/prakasa1904/ai-commerce/internal/features/user/domain"
	usersusecase "github.com/prakasa1904/ai-commerce/internal/features/user/usecase"
	sharederrors "github.com/prakasa1904/ai-commerce/internal/shared/errors"
	"github.com/prakasa1904/ai-commerce/internal/shared/middleware"

	"go.uber.org/zap"
)

// UserShop is the shop projection returned by the /me endpoint.
type UserShop struct {
	ID      int64  `json:"id"`
	Name    string `json:"name"`
	OwnerID int64  `json:"ownerId"`
}

// UserAuthHandler serves the public auth routes under /api/auth.
type UserAuthHandler struct {
	users     *usersusecase.UserUsecase
	meShops   *shopsusecase.ShopUsecase
	validator validator
	logger    *zap.Logger
}

// Register creates a new account.
func (h *UserAuthHandler) Register(c *fiber.Ctx) error {
	var req RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return writeError(c, "invalid request body", fiber.StatusBadRequest)
	}
	if err := h.validator.ValidateStruct(req); err != nil {
		return writeError(c, "invalid request payload", fiber.StatusBadRequest)
	}

	role := req.Role
	if role == "" {
		role = usersdomain.RoleBuyer
	}
	session, err := h.users.Register(c.Context(), usersusecase.RegisterInput{
		Username: req.Username,
		Name:     strings.TrimSpace(req.Username),
		Email:    req.Email,
		Password: req.Password,
		Role:     role,
	})
	if err != nil {
		return h.handleError(c, err)
	}
	return c.Status(fiber.StatusCreated).JSON(session)
}

// Login verifies credentials and returns a session.
func (h *UserAuthHandler) Login(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return writeError(c, "invalid request body", fiber.StatusBadRequest)
	}
	if err := h.validator.ValidateStruct(req); err != nil {
		return writeError(c, "invalid request payload", fiber.StatusBadRequest)
	}

	session, err := h.users.Login(c.Context(), usersusecase.LoginInput{Email: req.Email, Password: req.Password})
	if err != nil {
		return h.handleError(c, err)
	}
	return c.JSON(session)
}

// Me returns the authenticated profile and the shops it owns.
func (h *UserAuthHandler) Me(c *fiber.Ctx) error {
	claims := middleware.ClaimsFrom(c)
	user, err := h.users.Me(c.Context(), claims)
	if err != nil {
		return h.handleError(c, err)
	}

	shops, err := h.meShops.List(c.Context(), claims.ID, claims.IsAdmin, shopsusecase.ListOptions{})
	if err != nil {
		return h.handleError(c, err)
	}
	userShops := make([]UserShop, 0, len(shops))
	for i := range shops {
		userShops = append(userShops, UserShop{ID: shops[i].ID, Name: shops[i].Name, OwnerID: shops[i].OwnerID})
	}

	return c.JSON(map[string]any{
		"user":  user,
		"shops": userShops,
	})
}

// handleError maps a usecase error to a safe HTTP response.
func (h *UserAuthHandler) handleError(c *fiber.Ctx, err error) error {
	status := fiber.StatusInternalServerError
	switch {
	case errors.Is(err, sharederrors.ErrNotFound):
		status = fiber.StatusNotFound
	case errors.Is(err, sharederrors.ErrForbidden):
		status = fiber.StatusForbidden
	case errors.Is(err, sharederrors.ErrConflict):
		status = fiber.StatusConflict
	case errors.Is(err, sharederrors.ErrUnauthenticated), errors.Is(err, sharederrors.ErrInvalidToken):
		status = fiber.StatusUnauthorized
	case errors.Is(err, sharederrors.ErrBadRequest):
		status = fiber.StatusBadRequest
	case errors.Is(err, sharederrors.ErrValidationFailed):
		status = fiber.StatusBadRequest
	}
	return writeError(c, err.Error(), status)
}

func writeError(c *fiber.Ctx, message string, status int) error {
	return c.Status(status).JSON(map[string]string{"error": message})
}
