package usecase

import (
	"context"
	"fmt"
	"time"

	productdomain "github.com/prakasa1904/ai-commerce/internal/features/product/domain"
	shopdomain "github.com/prakasa1904/ai-commerce/internal/features/shop/domain"
	sharederrors "github.com/prakasa1904/ai-commerce/internal/shared/errors"
	"go.uber.org/zap"
)

// ShopUsecase is the application service for shops: storefront CRUD, member
// management and the products offered inside a shop.
type ShopUsecase struct {
	shops  ShopRepository
	logger *zap.Logger
}

// NewShopUsecase assembles the shop application service.
func NewShopUsecase(shops ShopRepository, logger *zap.Logger) *ShopUsecase {
	return &ShopUsecase{shops: shops, logger: logger}
}

// List returns shops visible to the actor. Platform admins see every shop
// (optionally including soft-deleted rows); other users see only their own.
func (u *ShopUsecase) List(ctx context.Context, actorID int64, isAdmin bool, opts ListOptions) ([]shopdomain.Shop, error) {
	ownerID := int64(0)
	if !isAdmin {
		ownerID = actorID
		opts.IncludeDeleted = false
	}
	return u.shops.List(ctx, opts.IncludeDeleted, ownerID, opts.Query)
}

// Get returns a single shop the actor is allowed to see. Non-admin actors may
// only read shops they own or are a member of; anything else reads as not found
// to avoid leaking existence.
func (u *ShopUsecase) Get(ctx context.Context, actorID int64, isAdmin bool, id int64) (*shopdomain.Shop, error) {
	shop, err := u.shops.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	if !isAdmin {
		if shop.OwnerID == actorID {
			return shop, nil
		}
		role, exists, err := u.shops.GetMembershipRole(ctx, id, actorID)
		if err != nil {
			return nil, err
		}
		if !exists || role == shopdomain.MembershipNonAdmin {
			// members can read; non-members get not found
			if !exists {
				return nil, shopdomain.ErrShopNotFound
			}
		}
	}
	return shop, nil
}

// Create registers a new shop owned by the actor.
func (u *ShopUsecase) Create(ctx context.Context, ownerID int64, in CreateInput) (*shopdomain.Shop, error) {
	if ownerID == 0 {
		return nil, sharederrors.ErrBadRequest
	}
	now := time.Now().UnixMilli()
	s := shopdomain.Shop{
		Name:        in.Name,
		Description: in.Description,
		Website:     in.Website,
		Phone:       in.Phone,
		Email:       in.Email,
		Address:     in.Address,
		Employees:   in.Employees,
		OwnerID:     ownerID,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
	return u.shops.Create(ctx, ownerID, s)
}

// Update applies partial changes when the actor may access the shop.
func (u *ShopUsecase) Update(ctx context.Context, actorID int64, isAdmin bool, id int64, in UpdateInput) (*shopdomain.Shop, error) {
	if !isAdmin {
		shop, err := u.shops.Get(ctx, id)
		if err != nil {
			if err == shopdomain.ErrShopNotFound {
				return nil, err
			}
			return nil, err
		}
		if shop.OwnerID != actorID {
			role, exists, err := u.shops.GetMembershipRole(ctx, id, actorID)
			if err != nil {
				return nil, err
			}
			if !exists || role == shopdomain.MembershipNonAdmin {
				return nil, sharederrors.ErrForbidden
			}
		}
	}
	fields := map[string]any{}
	if in.Name != nil {
		fields["name"] = *in.Name
	}
	if in.Description != nil {
		fields["description"] = *in.Description
	}
	if in.Website != nil {
		fields["website"] = *in.Website
	}
	if in.Phone != nil {
		fields["phone"] = *in.Phone
	}
	if in.Email != nil {
		fields["email"] = *in.Email
	}
	if in.Address != nil {
		fields["address"] = *in.Address
	}
	if in.Employees != nil {
		fields["employees"] = *in.Employees
	}
	if len(fields) == 0 {
		return u.Get(ctx, actorID, isAdmin, id)
	}
	return u.shops.Update(ctx, id, fields, time.Now().UnixMilli())
}

// Delete soft-deletes a shop when the actor may manage it (owner, platform
// admin, or a shop admin member).
func (u *ShopUsecase) Delete(ctx context.Context, actorID int64, isAdmin bool, id int64) error {
	allowed, err := u.canManage(ctx, actorID, isAdmin, id)
	if err != nil {
		return err
	}
	if !allowed {
		return sharederrors.ErrForbidden
	}
	return u.shops.SoftDelete(ctx, id, time.Now().UnixMilli())
}

// Restore undoes a soft delete of a shop.
func (u *ShopUsecase) Restore(ctx context.Context, id int64) error {
	return u.shops.Restore(ctx, id, time.Now().UnixMilli())
}

// ListMembers returns the active members of a shop.
func (u *ShopUsecase) ListMembers(ctx context.Context, shopID int64) ([]shopdomain.Member, error) {
	return u.shops.ListMembers(ctx, shopID)
}

// AddMember joins a user to a shop when the actor may manage it.
func (u *ShopUsecase) AddMember(ctx context.Context, actorID int64, isAdmin bool, shopID, userID int64, role shopdomain.MembershipRole) ([]shopdomain.Member, error) {
	allowed, err := u.canManage(ctx, actorID, isAdmin, shopID)
	if err != nil {
		return nil, err
	}
	if !allowed {
		return nil, sharederrors.ErrForbidden
	}
	return u.shops.AddMember(ctx, shopID, userID, role)
}

// UpdateMember changes a member's role when the actor may manage the shop.
func (u *ShopUsecase) UpdateMember(ctx context.Context, actorID int64, isAdmin bool, shopID, userID int64, role shopdomain.MembershipRole) ([]shopdomain.Member, error) {
	allowed, err := u.canManage(ctx, actorID, isAdmin, shopID)
	if err != nil {
		return nil, err
	}
	if !allowed {
		return nil, sharederrors.ErrForbidden
	}
	return u.shops.UpdateMember(ctx, shopID, userID, role)
}

// RemoveMember drops a membership when the actor is a platform admin or a
// shop admin member; non-admin members cannot delete membership records.
func (u *ShopUsecase) RemoveMember(ctx context.Context, actorID int64, isAdmin bool, shopID, userID int64) error {
	requesterRole := shopdomain.MembershipNonAdmin
	if isAdmin {
		requesterRole = shopdomain.MembershipAdmin
	} else {
		role, exists, err := u.shops.GetMembershipRole(ctx, shopID, actorID)
		if err != nil {
			return err
		}
		if exists {
			requesterRole = role
		} else {
			shop, err := u.shops.Get(ctx, shopID)
			if err != nil {
				return err
			}
			if shop.OwnerID == actorID {
				requesterRole = shopdomain.MembershipAdmin
			}
		}
	}
	if requesterRole != shopdomain.MembershipAdmin {
		return fmt.Errorf("non-admin members cannot delete: %w", sharederrors.ErrForbidden)
	}
	return u.shops.RemoveMember(ctx, shopID, userID, requesterRole)
}

// ListProducts returns the products offered inside a shop.
func (u *ShopUsecase) ListProducts(ctx context.Context, shopID int64) ([]productdomain.ShopProduct, error) {
	return u.shops.ListProducts(ctx, shopID)
}

// canManage reports whether the actor may manage a shop: platform admin, the
// owner, or a shop member holding the admin role.
func (u *ShopUsecase) canManage(ctx context.Context, actorID int64, isAdmin bool, shopID int64) (bool, error) {
	if isAdmin {
		return true, nil
	}
	shop, err := u.shops.Get(ctx, shopID)
	if err != nil {
		return false, err
	}
	if shop.OwnerID == actorID {
		return true, nil
	}
	role, exists, err := u.shops.GetMembershipRole(ctx, shopID, actorID)
	if err != nil {
		return false, err
	}
	return exists && role == shopdomain.MembershipAdmin, nil
}
