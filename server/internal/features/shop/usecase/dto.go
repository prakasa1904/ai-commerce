package usecase

import (
	"context"

	productdomain "github.com/prakasa1904/ai-commerce/internal/features/product/domain"
	shopdomain "github.com/prakasa1904/ai-commerce/internal/features/shop/domain"
)

// ListOptions controls the shop listing for an actor.
type ListOptions struct {
	IncludeDeleted bool
	Query          string
}

// CreateInput is the validated shop creation payload.
type CreateInput struct {
	Name        string
	Description string
	Website     string
	Phone       string
	Email       string
	Address     string
	Employees   string
}

// UpdateInput carries optional, partial shop changes.
type UpdateInput struct {
	Name        *string
	Description *string
	Website     *string
	Phone       *string
	Email       *string
	Address     *string
	Employees   *string
}

// ShopRepository is the persistence port used by the shop usecase.
type ShopRepository interface {
	List(ctx context.Context, includeDeleted bool, ownerID int64, query string) ([]shopdomain.Shop, error)
	Get(ctx context.Context, id int64) (*shopdomain.Shop, error)
	Create(ctx context.Context, ownerID int64, s shopdomain.Shop) (*shopdomain.Shop, error)
	Update(ctx context.Context, id int64, fields map[string]any, updatedAt int64) (*shopdomain.Shop, error)
	SoftDelete(ctx context.Context, id, deletedAt int64) error
	Restore(ctx context.Context, id, updatedAt int64) error

	// Membership persistence.
	GetMembershipRole(ctx context.Context, shopID, userID int64) (shopdomain.MembershipRole, bool, error)
	ListMembers(ctx context.Context, shopID int64) ([]shopdomain.Member, error)
	AddMember(ctx context.Context, shopID, userID int64, role shopdomain.MembershipRole) ([]shopdomain.Member, error)
	UpdateMember(ctx context.Context, shopID, userID int64, role shopdomain.MembershipRole) ([]shopdomain.Member, error)
	RemoveMember(ctx context.Context, shopID, userID int64, requesterRole shopdomain.MembershipRole) error

	// Products linked to a shop.
	ListProducts(ctx context.Context, shopID int64) ([]productdomain.ShopProduct, error)

	// RelationshipsCleaner cascade operations used when a user is deleted.
	SoftDeleteShopsByOwner(ctx context.Context, ownerID, deletedAt int64) error
	SoftDeleteMembershipsByUser(ctx context.Context, userID, deletedAt int64) error
}
