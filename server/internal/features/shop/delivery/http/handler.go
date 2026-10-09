package http

import (
	"errors"
	"strconv"

	"github.com/gofiber/fiber/v2"

	shopdomain "github.com/prakasa1904/ai-commerce/internal/features/shop/domain"
	shopsusecase "github.com/prakasa1904/ai-commerce/internal/features/shop/usecase"
	sharederrors "github.com/prakasa1904/ai-commerce/internal/shared/errors"
)

// ShopAdminHandler serves the shop management endpoints under /api/admin/shops.
type ShopAdminHandler struct {
	shops     *shopsusecase.ShopUsecase
	validator validator
}

// paramID parses a path id parameter.
func paramID(c *fiber.Ctx) (int64, error) {
	return strconv.ParseInt(c.Params("id"), 10, 64)
}

// paramUserID parses a member user id parameter.
func paramUserID(c *fiber.Ctx) (int64, error) {
	return strconv.ParseInt(c.Params("userId"), 10, 64)
}

// actorFrom extracts the authenticated actor id and admin flag.
func actorFrom(c *fiber.Ctx) (int64, bool) {
	claims := claimsFrom(c)
	return claims.ID, claims.IsAdmin
}

// ListShops returns the shops visible to the actor.
func (h *ShopAdminHandler) ListShops(c *fiber.Ctx) error {
	actorID, isAdmin := actorFrom(c)
	includeDeleted := isAdmin && c.Query("includeDeleted") == "1"
	shops, err := h.shops.List(c.Context(), actorID, isAdmin, shopsusecase.ListOptions{
		IncludeDeleted: includeDeleted,
		Query:          c.Query("q"),
	})
	if err != nil {
		return writeError(c, err.Error(), fiber.StatusInternalServerError)
	}
	public := make([]shopdomain.ShopPublic, 0, len(shops))
	for i := range shops {
		public = append(public, shops[i].ToPublic())
	}
	return c.JSON(map[string]any{"count": len(public), "shops": public})
}

// CreateShop creates a shop owned by the actor.
func (h *ShopAdminHandler) CreateShop(c *fiber.Ctx) error {
	actorID, _ := actorFrom(c)
	var req CreateShopRequest
	if err := c.BodyParser(&req); err != nil {
		return writeError(c, "invalid request body", fiber.StatusBadRequest)
	}
	if err := h.validator.ValidateStruct(req); err != nil {
		return writeError(c, "invalid request payload", fiber.StatusBadRequest)
	}
	shop, err := h.shops.Create(c.Context(), actorID, shopsusecase.CreateInput{
		Name:        req.Name,
		Description: req.Description,
		Website:     req.Website,
		Phone:       req.Phone,
		Email:       req.Email,
		Address:     req.Address,
		Employees:   req.Employees,
	})
	if err != nil {
		status := fiber.StatusBadRequest
		if errors.Is(err, sharederrors.ErrBadRequest) {
			status = fiber.StatusBadRequest
		}
		return writeError(c, err.Error(), status)
	}
	public := shop.ToPublic()
	return c.Status(fiber.StatusCreated).JSON(map[string]any{"shop": public})
}

// GetShop returns a single shop the actor can access.
func (h *ShopAdminHandler) GetShop(c *fiber.Ctx) error {
	actorID, isAdmin := actorFrom(c)
	id, err := paramID(c)
	if err != nil {
		return writeError(c, "invalid id", fiber.StatusBadRequest)
	}
	shop, err := h.shops.Get(c.Context(), actorID, isAdmin, id)
	if err != nil {
		if errors.Is(err, sharederrors.ErrNotFound) || errors.Is(err, shopdomain.ErrShopNotFound) {
			return writeError(c, "Shop not found.", fiber.StatusNotFound)
		}
		return writeError(c, err.Error(), fiber.StatusInternalServerError)
	}
	public := shop.ToPublic()
	return c.JSON(map[string]any{"shop": public})
}

// UpdateShop applies partial changes to a shop.
func (h *ShopAdminHandler) UpdateShop(c *fiber.Ctx) error {
	actorID, isAdmin := actorFrom(c)
	id, err := paramID(c)
	if err != nil {
		return writeError(c, "invalid id", fiber.StatusBadRequest)
	}
	var req UpdateShopRequest
	if err := c.BodyParser(&req); err != nil {
		return writeError(c, "invalid request body", fiber.StatusBadRequest)
	}
	shop, err := h.shops.Update(c.Context(), actorID, isAdmin, id, shopsusecase.UpdateInput{
		Name:        req.Name,
		Description: req.Description,
		Website:     req.Website,
		Phone:       req.Phone,
		Email:       req.Email,
		Address:     req.Address,
		Employees:   req.Employees,
	})
	if err != nil {
		status := fiber.StatusBadRequest
		switch {
		case errors.Is(err, sharederrors.ErrNotFound), errors.Is(err, shopdomain.ErrShopNotFound):
			status = fiber.StatusNotFound
		case errors.Is(err, sharederrors.ErrForbidden):
			status = fiber.StatusForbidden
		}
		return writeError(c, err.Error(), status)
	}
	public := shop.ToPublic()
	return c.JSON(map[string]any{"shop": public})
}

// DeleteShop soft-deletes a shop.
func (h *ShopAdminHandler) DeleteShop(c *fiber.Ctx) error {
	actorID, isAdmin := actorFrom(c)
	id, err := paramID(c)
	if err != nil {
		return writeError(c, "invalid id", fiber.StatusBadRequest)
	}
	if err := h.shops.Delete(c.Context(), actorID, isAdmin, id); err != nil {
		status := fiber.StatusInternalServerError
		switch {
		case errors.Is(err, sharederrors.ErrNotFound), errors.Is(err, shopdomain.ErrShopNotFound):
			status = fiber.StatusNotFound
		case errors.Is(err, sharederrors.ErrForbidden):
			status = fiber.StatusForbidden
		}
		return writeError(c, err.Error(), status)
	}
	return c.JSON(map[string]bool{"ok": true})
}

// RestoreShop undoes a soft delete.
func (h *ShopAdminHandler) RestoreShop(c *fiber.Ctx) error {
	id, err := paramID(c)
	if err != nil {
		return writeError(c, "invalid id", fiber.StatusBadRequest)
	}
	if err := h.shops.Restore(c.Context(), id); err != nil {
		return writeError(c, err.Error(), fiber.StatusInternalServerError)
	}
	return c.JSON(map[string]bool{"ok": true})
}

// ListMembers returns the active members of a shop.
func (h *ShopAdminHandler) ListMembers(c *fiber.Ctx) error {
	id, err := paramID(c)
	if err != nil {
		return writeError(c, "invalid id", fiber.StatusBadRequest)
	}
	members, err := h.shops.ListMembers(c.Context(), id)
	if err != nil {
		return writeError(c, err.Error(), fiber.StatusInternalServerError)
	}
	return c.JSON(map[string]any{"members": members})
}

// AddMember joins a user to a shop.
func (h *ShopAdminHandler) AddMember(c *fiber.Ctx) error {
	actorID, isAdmin := actorFrom(c)
	shopID, err := paramID(c)
	if err != nil {
		return writeError(c, "invalid shop id", fiber.StatusBadRequest)
	}
	var req AddMemberRequest
	if err := c.BodyParser(&req); err != nil {
		return writeError(c, "invalid request body", fiber.StatusBadRequest)
	}
	if req.UserID <= 0 {
		return writeError(c, "userId is required.", fiber.StatusBadRequest)
	}
	members, err := h.shops.AddMember(c.Context(), actorID, isAdmin, shopID, req.UserID, req.Role)
	if err != nil {
		status := fiber.StatusInternalServerError
		switch {
		case errors.Is(err, sharederrors.ErrNotFound), errors.Is(err, shopdomain.ErrShopNotFound):
			status = fiber.StatusNotFound
		case errors.Is(err, sharederrors.ErrForbidden):
			status = fiber.StatusForbidden
		case errors.Is(err, sharederrors.ErrBadRequest):
			status = fiber.StatusBadRequest
		}
		return writeError(c, err.Error(), status)
	}
	return c.JSON(map[string]any{"members": members})
}

// UpdateMember changes a member's role.
func (h *ShopAdminHandler) UpdateMember(c *fiber.Ctx) error {
	actorID, isAdmin := actorFrom(c)
	shopID, err := paramID(c)
	if err != nil {
		return writeError(c, "invalid shop id", fiber.StatusBadRequest)
	}
	userID, err := paramUserID(c)
	if err != nil {
		return writeError(c, "invalid user id", fiber.StatusBadRequest)
	}
	var req UpdateMemberRequest
	if err := c.BodyParser(&req); err != nil {
		return writeError(c, "invalid request body", fiber.StatusBadRequest)
	}
	if err := h.validator.ValidateStruct(req); err != nil {
		return writeError(c, "role is required.", fiber.StatusBadRequest)
	}
	members, err := h.shops.UpdateMember(c.Context(), actorID, isAdmin, shopID, userID, req.Role)
	if err != nil {
		status := fiber.StatusInternalServerError
		switch {
		case errors.Is(err, sharederrors.ErrNotFound), errors.Is(err, shopdomain.ErrShopNotFound):
			status = fiber.StatusNotFound
		case errors.Is(err, sharederrors.ErrForbidden):
			status = fiber.StatusForbidden
		case errors.Is(err, sharederrors.ErrBadRequest):
			status = fiber.StatusBadRequest
		}
		return writeError(c, err.Error(), status)
	}
	return c.JSON(map[string]any{"members": members})
}

// RemoveMember drops a membership.
func (h *ShopAdminHandler) RemoveMember(c *fiber.Ctx) error {
	actorID, isAdmin := actorFrom(c)
	shopID, err := paramID(c)
	if err != nil {
		return writeError(c, "invalid shop id", fiber.StatusBadRequest)
	}
	userID, err := paramUserID(c)
	if err != nil {
		return writeError(c, "invalid user id", fiber.StatusBadRequest)
	}
	if err := h.shops.RemoveMember(c.Context(), actorID, isAdmin, shopID, userID); err != nil {
		status := fiber.StatusInternalServerError
		switch {
		case errors.Is(err, sharederrors.ErrNotFound), errors.Is(err, shopdomain.ErrShopNotFound):
			status = fiber.StatusNotFound
		case errors.Is(err, sharederrors.ErrForbidden):
			status = fiber.StatusForbidden
		}
		return writeError(c, err.Error(), status)
	}
	return c.JSON(map[string]bool{"ok": true})
}

// ListShopProducts returns the products offered in a shop.
func (h *ShopAdminHandler) ListShopProducts(c *fiber.Ctx) error {
	id, err := paramID(c)
	if err != nil {
		return writeError(c, "invalid shop id", fiber.StatusBadRequest)
	}
	products, err := h.shops.ListProducts(c.Context(), id)
	if err != nil {
		return writeError(c, err.Error(), fiber.StatusInternalServerError)
	}
	return c.JSON(map[string]any{"products": products})
}
