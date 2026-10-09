package http

import (
	"errors"
	"strconv"

	"github.com/gofiber/fiber/v2"

	usersdomain "github.com/prakasa1904/ai-commerce/internal/features/user/domain"
	usersusecase "github.com/prakasa1904/ai-commerce/internal/features/user/usecase"
	"github.com/prakasa1904/ai-commerce/internal/shared/middleware"
	sharederrors "github.com/prakasa1904/ai-commerce/internal/shared/errors"
)

// UserAdminHandler serves the platform-admin user CRUD under /api/admin/users.
type UserAdminHandler struct {
	users     *usersusecase.UserUsecase
	validator validator
}

func paramID(c *fiber.Ctx) (int64, error) {
	return strconv.ParseInt(c.Params("id"), 10, 64)
}

// adminFrom reports whether the authenticated actor is a platform admin. All
// /api/admin/users operations are reserved for platform admins (mirroring the
// legacy Node platformAdminOnly middleware).
func adminFrom(c *fiber.Ctx) bool {
	return middleware.ClaimsFrom(c).IsAdmin
}

// ListUsers returns the platform-admin user listing.
func (h *UserAdminHandler) ListUsers(c *fiber.Ctx) error {
	if !adminFrom(c) {
		return writeError(c, "Platform admins only.", fiber.StatusForbidden)
	}
	includeDeleted := c.Query("includeDeleted") == "1"
	q := c.Query("q")

	users, err := h.users.ListUsers(c.Context(), usersusecase.ListUsersOptions{
		Query:          q,
		IncludeDeleted: includeDeleted,
	})
	if err != nil {
		return writeError(c, err.Error(), fiber.StatusInternalServerError)
	}
	return c.JSON(map[string]any{"count": len(users), "users": users})
}

// CreateUser creates an account through the admin console.
func (h *UserAdminHandler) CreateUser(c *fiber.Ctx) error {
	var req CreateUserRequest
	if err := c.BodyParser(&req); err != nil {
		return writeError(c, "invalid request body", fiber.StatusBadRequest)
	}
	if err := h.validator.ValidateStruct(req); err != nil {
		return writeError(c, "invalid request payload", fiber.StatusBadRequest)
	}
	name := req.Name
	if name == "" {
		name = req.Username
	}
	role := req.Role
	if role == "" {
		role = usersdomain.RoleBuyer
	}

	user, err := h.users.CreateUser(c.Context(), true, usersusecase.CreateUserInput{
		Username: req.Username,
		Name:     name,
		Email:    req.Email,
		Password: req.Password,
		Role:     role,
		IsAdmin:  req.IsAdmin,
	})
	if err != nil {
		status := fiber.StatusInternalServerError
		switch {
		case errors.Is(err, usersdomain.ErrEmailExists):
			status = fiber.StatusConflict
		case errors.Is(err, sharederrors.ErrBadRequest):
			status = fiber.StatusBadRequest
		}
		return writeError(c, err.Error(), status)
	}
	return c.Status(fiber.StatusCreated).JSON(map[string]any{"user": user})
}

// GetUser returns a single user.
func (h *UserAdminHandler) GetUser(c *fiber.Ctx) error {
	id, err := paramID(c)
	if err != nil {
		return writeError(c, "invalid id", fiber.StatusBadRequest)
	}
	user, err := h.users.GetUser(c.Context(), true, id)
	if err != nil {
		if errors.Is(err, sharederrors.ErrNotFound) || errors.Is(err, usersdomain.ErrUserNotFound) {
			return writeError(c, "User not found.", fiber.StatusNotFound)
		}
		return writeError(c, err.Error(), fiber.StatusInternalServerError)
	}
	return c.JSON(map[string]any{"user": user})
}

// UpdateUser applies admin changes to a user.
func (h *UserAdminHandler) UpdateUser(c *fiber.Ctx) error {
	id, err := paramID(c)
	if err != nil {
		return writeError(c, "invalid id", fiber.StatusBadRequest)
	}
	var req UpdateUserRequest
	if err := c.BodyParser(&req); err != nil {
		return writeError(c, "invalid request body", fiber.StatusBadRequest)
	}
	user, err := h.users.UpdateUser(c.Context(), true, id, usersusecase.UpdateUserInput{
		Username: req.Username,
		Name:     req.Name,
		Email:    req.Email,
		Role:     req.Role,
		IsAdmin:  req.IsAdmin,
	})
	if err != nil {
		status := fiber.StatusBadRequest
		if errors.Is(err, sharederrors.ErrNotFound) || errors.Is(err, usersdomain.ErrUserNotFound) {
			status = fiber.StatusNotFound
		}
		return writeError(c, err.Error(), status)
	}
	return c.JSON(map[string]any{"user": user})
}

// DeleteUser soft-deletes a user.
func (h *UserAdminHandler) DeleteUser(c *fiber.Ctx) error {
	id, err := paramID(c)
	if err != nil {
		return writeError(c, "invalid id", fiber.StatusBadRequest)
	}
	if err := h.users.SoftDeleteUser(c.Context(), true, id); err != nil {
		return writeError(c, err.Error(), fiber.StatusInternalServerError)
	}
	return c.JSON(map[string]bool{"ok": true})
}

// RestoreUser undoes a user soft delete.
func (h *UserAdminHandler) RestoreUser(c *fiber.Ctx) error {
	id, err := paramID(c)
	if err != nil {
		return writeError(c, "invalid id", fiber.StatusBadRequest)
	}
	if err := h.users.RestoreUser(c.Context(), true, id); err != nil {
		return writeError(c, err.Error(), fiber.StatusInternalServerError)
	}
	return c.JSON(map[string]bool{"ok": true})
}
