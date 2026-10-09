package usecase

import (
	"context"
	"time"

	productDom "github.com/prakasa1904/ai-commerce/internal/features/product/domain"
	sharederrors "github.com/prakasa1904/ai-commerce/internal/shared/errors"
)

// ProductUsecase is the application service for products: the public catalog
// and the admin console's product management.
type ProductUsecase struct {
	repo  ProductRepository
	shops ShopProductStore
}

// NewProductUsecase assembles the product application service.
func NewProductUsecase(repo ProductRepository, shops ShopProductStore) *ProductUsecase {
	return &ProductUsecase{repo: repo, shops: shops}
}

// ListPublic returns the public catalog (non-deleted products).
func (u *ProductUsecase) ListPublic(ctx context.Context) ([]productDom.PublicProduct, error) {
	return u.repo.ListPublic(ctx)
}

// List returns the admin product listing for an actor.
// ownerID == 0 means the caller may see any user's products (admin).
func (u *ProductUsecase) List(ctx context.Context, actorID int64, isAdmin bool, opts ListOptions) ([]productDom.Product, error) {
	ownerID := opts.OwnerID
	if actorID != 0 && !isAdmin {
		ownerID = actorID
		opts.IncludeDeleted = false
	}
	return u.repo.List(ctx, ownerID, opts.IncludeDeleted, opts.Query)
}

// Get returns a single admin product projection.
func (u *ProductUsecase) Get(ctx context.Context, id int64) (*productDom.Product, error) {
	return u.repo.Get(ctx, id)
}

// Create creates a product owned by the given actor.
func (u *ProductUsecase) Create(ctx context.Context, ownerID int64, in CreateInput) (*productDom.Product, error) {
	if ownerID == 0 {
		return nil, sharederrors.ErrBadRequest
	}
	now := time.Now().UnixMilli()
	p := productDom.Product{
		Title:       in.Title,
		Name:        in.Title,
		Description: in.Description,
		Price:       in.Price,
		ImageURL:    in.ImageURL,
		Category:    in.Category,
		Unit:        in.Unit,
		Stock:       in.Stock,
		Wholesale:   in.Wholesale,
		OwnerID:     ownerID,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
	return u.repo.Create(ctx, ownerID, p)
}

// Update applies partial product changes when the actor owns the product
// (or is a platform admin).
func (u *ProductUsecase) Update(ctx context.Context, actorID int64, isAdmin bool, id int64, in UpdateInput) (*productDom.Product, error) {
	p, err := u.repo.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	if !isAdmin && p.OwnerID != actorID {
		return nil, sharederrors.ErrForbidden
	}

	fields := map[string]any{}
	if in.Title != nil {
		fields["title"] = *in.Title
	}
	if in.Description != nil {
		fields["description"] = *in.Description
	}
	if in.Price != nil {
		fields["price"] = *in.Price
	}
	if in.ImageURL != nil {
		fields["imageUrl"] = *in.ImageURL
	}
	if in.Category != nil {
		fields["category"] = *in.Category
	}
	if in.Unit != nil {
		fields["unit"] = *in.Unit
	}
	if in.Stock != nil {
		fields["stock"] = *in.Stock
	}
	if in.Wholesale != nil {
		fields["wholesale"] = wholesaleFlag(*in.Wholesale)
	}

	return u.repo.Update(ctx, id, fields, time.Now().UnixMilli())
}

// Delete soft-deletes a product (and its shop links) for its owner or admin.
func (u *ProductUsecase) Delete(ctx context.Context, actorID int64, isAdmin bool, id int64) error {
	p, err := u.repo.Get(ctx, id)
	if err != nil {
		return err
	}
	if !isAdmin && p.OwnerID != actorID {
		return sharederrors.ErrForbidden
	}
	return u.repo.SoftDelete(ctx, id, time.Now().UnixMilli())
}

// Restore restores a soft-deleted product.
func (u *ProductUsecase) Restore(ctx context.Context, id int64) error {
	return u.repo.Restore(ctx, id, time.Now().UnixMilli())
}

// ListShops returns the shops a product is linked to.
func (u *ProductUsecase) ListShops(ctx context.Context, productID int64) ([]productDom.ShopLink, error) {
	return u.shops.ShopsByProduct(ctx, productID)
}

// LinkProduct links a product to a shop when both belong to the same owner
// and the actor is allowed to do so.
func (u *ProductUsecase) LinkProduct(ctx context.Context, actorID int64, isAdmin bool, productID, shopID int64, price *int64, stock int) error {
	p, err := u.repo.Get(ctx, productID)
	if err != nil {
		return err
	}
	shopOwner, err := u.shops.OwnerIDOfShop(ctx, shopID)
	if err != nil {
		return err
	}
	if shopOwner != p.OwnerID {
		return sharederrors.ErrConflict
	}
	if !isAdmin && shopOwner != actorID {
		return sharederrors.ErrForbidden
	}
	return u.shops.LinkProduct(ctx, productID, shopID, price, stock)
}

// UnlinkProduct removes a product-to-shop link.
func (u *ProductUsecase) UnlinkProduct(ctx context.Context, actorID int64, isAdmin bool, productID, shopID int64) error {
	shopOwner, err := u.shops.OwnerIDOfShop(ctx, shopID)
	if err != nil {
		return err
	}
	if !isAdmin && shopOwner != actorID {
		return sharederrors.ErrForbidden
	}
	return u.shops.UnlinkProduct(ctx, productID, shopID)
}

func wholesaleFlag(b bool) int {
	if b {
		return 1
	}
	return 0
}
