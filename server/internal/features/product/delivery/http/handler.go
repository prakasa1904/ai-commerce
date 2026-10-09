package http

import (
	"errors"
	"strconv"

	"github.com/gofiber/fiber/v2"

	productdomain "github.com/prakasa1904/ai-commerce/internal/features/product/domain"
	productusecase "github.com/prakasa1904/ai-commerce/internal/features/product/usecase"
	sharederrors "github.com/prakasa1904/ai-commerce/internal/shared/errors"
)

// ProductHandler serves the public catalog and the admin product management
// endpoints.
type ProductHandler struct {
	products  *productusecase.ProductUsecase
	validator validator
}

func paramID(c *fiber.Ctx) (int64, error) {
	return strconv.ParseInt(c.Params("id"), 10, 64)
}

func actorFrom(c *fiber.Ctx) (int64, bool) {
	claims := claimsFrom(c)
	return claims.ID, claims.IsAdmin
}

// ListPublic returns the public catalog of non-deleted products.
func (h *ProductHandler) ListPublic(c *fiber.Ctx) error {
	items, err := h.products.ListPublic(c.Context())
	if err != nil {
		return writeError(c, err.Error(), fiber.StatusInternalServerError)
	}
	return c.JSON(map[string]any{"count": len(items), "products": items})
}

// ListAdmin returns the admin product listing for the actor.
func (h *ProductHandler) ListAdmin(c *fiber.Ctx) error {
	actorID, isAdmin := actorFrom(c)
	includeDeleted := isAdmin && c.Query("includeDeleted") == "1"
	items, err := h.products.List(c.Context(), actorID, isAdmin, productusecase.ListOptions{
		IncludeDeleted: includeDeleted,
		Query:          c.Query("q"),
	})
	if err != nil {
		return writeError(c, err.Error(), fiber.StatusInternalServerError)
	}
	return c.JSON(map[string]any{"count": len(items), "products": items})
}

// CreateAdmin creates a product owned by the actor.
func (h *ProductHandler) CreateAdmin(c *fiber.Ctx) error {
	actorID, _ := actorFrom(c)
	var req CreateProductRequest
	if err := c.BodyParser(&req); err != nil {
		return writeError(c, "invalid request body", fiber.StatusBadRequest)
	}
	if err := h.validator.ValidateStruct(req); err != nil {
		return writeError(c, "invalid request payload", fiber.StatusBadRequest)
	}
	product, err := h.products.Create(c.Context(), actorID, productusecase.CreateInput{
		Title:       req.Title,
		Description: req.Description,
		Price:       req.Price,
		ImageURL:    req.ImageURL,
		Category:    req.Category,
		Unit:        req.Unit,
		Stock:       req.Stock,
		Wholesale:   req.Wholesale,
	})
	if err != nil {
		status := fiber.StatusBadRequest
		if errors.Is(err, sharederrors.ErrBadRequest) {
			status = fiber.StatusBadRequest
		}
		return writeError(c, err.Error(), status)
	}
	return c.Status(fiber.StatusCreated).JSON(map[string]any{"product": product})
}

// GetAdmin returns a single admin product projection.
func (h *ProductHandler) GetAdmin(c *fiber.Ctx) error {
	id, err := paramID(c)
	if err != nil {
		return writeError(c, "invalid id", fiber.StatusBadRequest)
	}
	product, err := h.products.Get(c.Context(), id)
	if err != nil {
		return writeError(c, err.Error(), errorStatus(err))
	}
	return c.JSON(map[string]any{"product": product})
}

// UpdateAdmin applies partial changes to a product.
func (h *ProductHandler) UpdateAdmin(c *fiber.Ctx) error {
	actorID, isAdmin := actorFrom(c)
	id, err := paramID(c)
	if err != nil {
		return writeError(c, "invalid id", fiber.StatusBadRequest)
	}
	var req UpdateProductRequest
	if err := c.BodyParser(&req); err != nil {
		return writeError(c, "invalid request body", fiber.StatusBadRequest)
	}
	product, err := h.products.Update(c.Context(), actorID, isAdmin, id, productusecase.UpdateInput{
		Title:       req.Title,
		Description: req.Description,
		Price:       req.Price,
		ImageURL:    req.ImageURL,
		Category:    req.Category,
		Unit:        req.Unit,
		Stock:       req.Stock,
		Wholesale:   req.Wholesale,
	})
	if err != nil {
		return writeError(c, err.Error(), errorStatus(err))
	}
	return c.JSON(map[string]any{"product": product})
}

// DeleteAdmin soft-deletes a product.
func (h *ProductHandler) DeleteAdmin(c *fiber.Ctx) error {
	actorID, isAdmin := actorFrom(c)
	id, err := paramID(c)
	if err != nil {
		return writeError(c, "invalid id", fiber.StatusBadRequest)
	}
	if err := h.products.Delete(c.Context(), actorID, isAdmin, id); err != nil {
		return writeError(c, err.Error(), errorStatus(err))
	}
	return c.JSON(map[string]bool{"ok": true})
}

// RestoreAdmin undoes a product soft delete.
func (h *ProductHandler) RestoreAdmin(c *fiber.Ctx) error {
	id, err := paramID(c)
	if err != nil {
		return writeError(c, "invalid id", fiber.StatusBadRequest)
	}
	if err := h.products.Restore(c.Context(), id); err != nil {
		return writeError(c, err.Error(), fiber.StatusInternalServerError)
	}
	return c.JSON(map[string]bool{"ok": true})
}

// ListProductShops returns the shops a product is linked to.
func (h *ProductHandler) ListProductShops(c *fiber.Ctx) error {
	id, err := paramID(c)
	if err != nil {
		return writeError(c, "invalid id", fiber.StatusBadRequest)
	}
	shops, err := h.products.ListShops(c.Context(), id)
	if err != nil {
		return writeError(c, err.Error(), errorStatus(err))
	}
	return c.JSON(map[string]any{"shops": shops})
}

// LinkProductToShop links a product to a shop.
func (h *ProductHandler) LinkProductToShop(c *fiber.Ctx) error {
	actorID, isAdmin := actorFrom(c)
	productID, err := paramID(c)
	if err != nil {
		return writeError(c, "invalid product id", fiber.StatusBadRequest)
	}
	var req LinkProductRequest
	if err := c.BodyParser(&req); err != nil {
		return writeError(c, "invalid request body", fiber.StatusBadRequest)
	}
	if err := h.validator.ValidateStruct(req); err != nil {
		return writeError(c, "shopId is required.", fiber.StatusBadRequest)
	}
	stock := req.Stock
	err = h.products.LinkProduct(c.Context(), actorID, isAdmin, productID, req.ShopID, req.Price, stock)
	if err != nil {
		return writeError(c, err.Error(), linkStatus(err))
	}
	return c.JSON(map[string]bool{"ok": true})
}

// UnlinkProductFromShop removes a product-to-shop link.
func (h *ProductHandler) UnlinkProductFromShop(c *fiber.Ctx) error {
	actorID, isAdmin := actorFrom(c)
	productID, err := paramID(c)
	if err != nil {
		return writeError(c, "invalid product id", fiber.StatusBadRequest)
	}
	shopID, err := strconv.ParseInt(c.Params("shopId"), 10, 64)
	if err != nil {
		return writeError(c, "invalid shop id", fiber.StatusBadRequest)
	}
	if err := h.products.UnlinkProduct(c.Context(), actorID, isAdmin, productID, shopID); err != nil {
		return writeError(c, err.Error(), errorStatus(err))
	}
	return c.JSON(map[string]bool{"ok": true})
}

// errorStatus maps a usecase error to a sensible HTTP status.
func errorStatus(err error) int {
	switch {
	case errors.Is(err, productdomain.ErrProductNotFound):
		return fiber.StatusNotFound
	case errors.Is(err, sharederrors.ErrForbidden):
		return fiber.StatusForbidden
	default:
		return fiber.StatusInternalServerError
	}
}

// linkStatus maps link-related errors, most notably the ownership conflict.
func linkStatus(err error) int {
	if errors.Is(err, sharederrors.ErrConflict) {
		return fiber.StatusConflict
	}
	return errorStatus(err)
}
