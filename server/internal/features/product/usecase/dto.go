package usecase

import "context"

import (
	"github.com/prakasa1904/ai-commerce/internal/features/product/domain"
)

// ListOptions controls the admin product listing.
type ListOptions struct {
	OwnerID        int64
	IncludeDeleted bool
	Query          string
}

// CreateInput is the validated product creation payload.
type CreateInput struct {
	Title       string
	Description string
	Price       int64
	ImageURL    string
	Category    string
	Unit        string
	Stock       int
	Wholesale   bool
}

// UpdateInput carries optional, partial product changes.
type UpdateInput struct {
	Title       *string
	Description *string
	Price       *int64
	ImageURL    *string
	Category    *string
	Unit        *string
	Stock       *int
	Wholesale   *bool
}

// ProductRepository is the domain persistence port for products.
type ProductRepository interface {
	List(ctx context.Context, ownerID int64, includeDeleted bool, query string) ([]domain.Product, error)
	ListPublic(ctx context.Context) ([]domain.PublicProduct, error)
	Get(ctx context.Context, id int64) (*domain.Product, error)
	Create(ctx context.Context, ownerID int64, p domain.Product) (*domain.Product, error)
	Update(ctx context.Context, id int64, fields map[string]any, updatedAt int64) (*domain.Product, error)
	SoftDelete(ctx context.Context, id, deletedAt int64) error
	Restore(ctx context.Context, id, updatedAt int64) error
}

// ShopProductStore abstracts the shop/product join (owned by the shop
// feature) behind an interface so the product feature stays decoupled.
type ShopProductStore interface {
	OwnerIDOfShop(ctx context.Context, shopID int64) (int64, error)
	ShopsByProduct(ctx context.Context, productID int64) ([]domain.ShopLink, error)
	LinkProduct(ctx context.Context, productID, shopID int64, price *int64, stock int) error
	UnlinkProduct(ctx context.Context, productID, shopID int64) error
}
