package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	productdomain "github.com/prakasa1904/ai-commerce/internal/features/product/domain"
	shopdomain "github.com/prakasa1904/ai-commerce/internal/features/shop/domain"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// ShopRepository persists and queries shops, memberships and shop products.
type ShopRepository struct {
	db     *gorm.DB
	logger *zap.Logger
}

// NewShopRepository builds a repository backed by the given connection.
func NewShopRepository(db *gorm.DB, logger *zap.Logger) *ShopRepository {
	return &ShopRepository{db: db, logger: logger}
}

// List returns shops filtered by owner and optional query. ownerID == 0 lists
// every shop (platform admin).
func (r *ShopRepository) List(ctx context.Context, includeDeleted bool, ownerID int64, query string) ([]shopdomain.Shop, error) {
	stmt := r.db.WithContext(ctx).Model(&ShopModel{}).
		Select("shops.*, u.username AS owner_name").
		Joins("LEFT JOIN users u ON u.id = shops.owner_id").
		Order("shops.id DESC")

	if ownerID != 0 {
		stmt = stmt.Where("shops.owner_id = ?", ownerID)
	}
	if !includeDeleted {
		stmt = stmt.Where("shops.deleted_at IS NULL")
	}
	if query != "" {
		pattern := "%" + query + "%"
		stmt = stmt.Where("shops.name LIKE ? OR shops.description LIKE ?", pattern, pattern)
	}

	var models []ShopModel
	if err := stmt.Scan(&models).Error; err != nil {
		return nil, fmt.Errorf("list shops: %w", err)
	}

	shops := make([]shopdomain.Shop, 0, len(models))
	for i := range models {
		shops = append(shops, toDomainShop(models[i]))
	}
	return shops, nil
}

// Get returns one active shop or a domain error.
func (r *ShopRepository) Get(ctx context.Context, id int64) (*shopdomain.Shop, error) {
	var model ShopModel
	err := r.db.WithContext(ctx).
		Model(&ShopModel{}).
		Select("shops.*, u.username AS owner_name").
		Joins("LEFT JOIN users u ON u.id = shops.owner_id").
		Where("shops.id = ? AND shops.deleted_at IS NULL", id).
		Scan(&model).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, shopdomain.ErrShopNotFound
		}
		return nil, fmt.Errorf("get shop %d: %w", id, err)
	}
	shop := toDomainShop(model)
	return &shop, nil
}

// Create inserts a shop owned by ownerID.
func (r *ShopRepository) Create(ctx context.Context, ownerID int64, s shopdomain.Shop) (*shopdomain.Shop, error) {
	model := toShopModel(s)
	if ownerID != 0 {
		model.OwnerID = ownerID
	}
	if err := r.db.WithContext(ctx).Create(&model).Error; err != nil {
		return nil, fmt.Errorf("create shop: %w", err)
	}
	s.ID = model.ID
	return &s, nil
}

// Update applies partial updates to a shop.
func (r *ShopRepository) Update(ctx context.Context, id int64, fields map[string]any, updatedAt int64) (*shopdomain.Shop, error) {
	if len(fields) == 0 {
		return r.Get(ctx, id)
	}
	fields["updated_at"] = updatedAt
	if err := r.db.WithContext(ctx).Model(&ShopModel{}).Where("id = ?", id).Updates(fields).Error; err != nil {
		return nil, fmt.Errorf("update shop %d: %w", id, err)
	}
	return r.Get(ctx, id)
}

// SoftDelete marks a shop as deleted after soft-deleting its memberships and
// product links.
func (r *ShopRepository) SoftDelete(ctx context.Context, id, deletedAt int64) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&ShopMemberModel{}).Where("shop_id = ? AND deleted_at IS NULL", id).UpdateColumn("deleted_at", deletedAt).Error; err != nil {
			return err
		}
		if err := tx.Model(&ShopProductModel{}).Where("shop_id = ? AND deleted_at IS NULL", id).UpdateColumn("deleted_at", deletedAt).Error; err != nil {
			return err
		}
		return tx.Model(&ShopModel{}).Where("id = ?", id).UpdateColumns(map[string]any{
			"deleted_at": deletedAt,
			"updated_at": deletedAt,
		}).Error
	})
}

// Restore clears a shop's deleted flag.
func (r *ShopRepository) Restore(ctx context.Context, id, updatedAt int64) error {
	err := r.db.WithContext(ctx).Model(&ShopModel{}).Where("id = ?", id).
		UpdateColumns(map[string]any{"deleted_at": nil, "updated_at": updatedAt}).Error
	return err
}

// GetMembershipRole returns the active role of a user inside a shop.
func (r *ShopRepository) GetMembershipRole(ctx context.Context, shopID, userID int64) (shopdomain.MembershipRole, bool, error) {
	var model ShopMemberModel
	err := r.db.WithContext(ctx).
		Where("shop_id = ? AND user_id = ? AND deleted_at IS NULL", shopID, userID).
		Select("role").
		Take(&model).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", false, nil
		}
		return "", false, fmt.Errorf("get membership role: %w", err)
	}
	return shopdomain.MembershipRole(model.Role), true, nil
}

// ListMembers returns the active members of a shop joined with user data.
func (r *ShopRepository) ListMembers(ctx context.Context, shopID int64) ([]shopdomain.Member, error) {
	var rows []struct {
		UserID    int64  `gorm:"column:user_id"`
		Username  string `gorm:"column:username"`
		Name      string `gorm:"column:name"`
		Email     string `gorm:"column:email"`
		Role      string `gorm:"column:role"`
		CreatedAt int64  `gorm:"column:created_at"`
		DeletedAt *int64 `gorm:"column:deleted_at"`
	}
	err := r.db.WithContext(ctx).
		Table("shop_members m").
		Select("m.role, m.created_at, m.deleted_at, u.id AS user_id, u.username, u.name, u.email").
		Joins("JOIN users u ON u.id = m.user_id").
		Where("m.shop_id = ? AND m.deleted_at IS NULL", shopID).
		Scan(&rows).Error
	if err != nil {
		return nil, fmt.Errorf("list shop members: %w", err)
	}

	members := make([]shopdomain.Member, 0, len(rows))
	for i := range rows {
		members = append(members, shopdomain.Member{
			ShopID:    shopID,
			UserID:    rows[i].UserID,
			Username:  rows[i].Username,
			Name:      rows[i].Name,
			Email:     rows[i].Email,
			Role:      shopdomain.MembershipRole(rows[i].Role),
			CreatedAt: rows[i].CreatedAt,
			DeletedAt: rows[i].DeletedAt,
		})
	}
	return members, nil
}

// AddMember inserts or reactivates a membership for a user.
func (r *ShopRepository) AddMember(ctx context.Context, shopID, userID int64, role shopdomain.MembershipRole) ([]shopdomain.Member, error) {
	now := timeNowMillis()
	var model ShopMemberModel
	err := r.db.WithContext(ctx).
		Where("shop_id = ? AND user_id = ?", shopID, userID).
		Order("id DESC").
		First(&model).Error
	if err == nil {
		// Reactivate an existing (possibly soft-deleted) membership.
		if err := r.db.WithContext(ctx).Model(&ShopMemberModel{}).
			Where("shop_id = ? AND user_id = ?", shopID, userID).
			UpdateColumns(map[string]any{
				"role":       role,
				"created_at": now,
				"deleted_at": nil,
			}).Error; err != nil {
			return nil, fmt.Errorf("reactivate membership: %w", err)
		}
		return r.ListMembers(ctx, shopID)
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("check membership: %w", err)
	}
	if err := r.db.WithContext(ctx).Create(&ShopMemberModel{
		ShopID: shopID, UserID: userID,
		Role: string(role), CreatedAt: now,
	}).Error; err != nil {
		return nil, fmt.Errorf("add shop member: %w", err)
	}
	return r.ListMembers(ctx, shopID)
}

// UpdateMember changes the role of an existing active membership.
func (r *ShopRepository) UpdateMember(ctx context.Context, shopID, userID int64, role shopdomain.MembershipRole) ([]shopdomain.Member, error) {
	if err := r.db.WithContext(ctx).Model(&ShopMemberModel{}).
		Where("shop_id = ? AND user_id = ? AND deleted_at IS NULL", shopID, userID).
		UpdateColumns(map[string]any{
			"role":       role,
			"created_at": timeNowMillis(),
		}).Error; err != nil {
		return nil, fmt.Errorf("update shop member: %w", err)
	}
	return r.ListMembers(ctx, shopID)
}

// RemoveMember soft-deletes a membership. Non-admin requesters are rejected by
// the usecase before reaching the repository, but the guard is repeated here
// for defense in depth.
func (r *ShopRepository) RemoveMember(ctx context.Context, shopID, userID int64, requesterRole shopdomain.MembershipRole) error {
	if requesterRole != shopdomain.MembershipAdmin {
		return shopdomain.ErrMembershipNotFound
	}
	err := r.db.WithContext(ctx).Model(&ShopMemberModel{}).
		Where("shop_id = ? AND user_id = ? AND deleted_at IS NULL", shopID, userID).
		UpdateColumn("deleted_at", timeNowMillis()).Error
	return err
}

// ListProducts returns the products offered inside a shop.
func (r *ShopRepository) ListProducts(ctx context.Context, shopID int64) ([]productdomain.ShopProduct, error) {
	var rows []struct {
		ProductID   int64  `gorm:"column:product_id"`
		ProductName string `gorm:"column:product_name"`
		Price       *int64 `gorm:"column:price"`
		Stock       int    `gorm:"column:stock"`
	}
	err := r.db.WithContext(ctx).
		Table("shop_products sp").
		Select("p.id AS product_id, p.title AS product_name, sp.price, sp.stock").
		Joins("JOIN products p ON p.id = sp.product_id").
		Where("sp.shop_id = ? AND sp.deleted_at IS NULL AND p.deleted_at IS NULL", shopID).
		Order("p.id DESC").
		Scan(&rows).Error
	if err != nil {
		return nil, fmt.Errorf("list shop products: %w", err)
	}

	out := make([]productdomain.ShopProduct, 0, len(rows))
	for i := range rows {
		out = append(out, productdomain.ShopProduct{
			ProductID:   rows[i].ProductID,
			ProductName: rows[i].ProductName,
			Price:       rows[i].Price,
			Stock:       rows[i].Stock,
		})
	}
	return out, nil
}

// SoftDeleteShopsByOwner cascade soft-deletes every shop a user owns.
func (r *ShopRepository) SoftDeleteShopsByOwner(ctx context.Context, ownerID, deletedAt int64) error {
	var shops []ShopModel
	if err := r.db.WithContext(ctx).Model(&ShopModel{}).Where("owner_id = ? AND deleted_at IS NULL", ownerID).Select("id").Find(&shops).Error; err != nil {
		return fmt.Errorf("list shops by owner: %w", err)
	}
	for i := range shops {
		if err := r.SoftDelete(ctx, shops[i].ID, deletedAt); err != nil {
			return fmt.Errorf("soft-delete shop %d: %w", shops[i].ID, err)
		}
	}
	return nil
}

// SoftDeleteMembershipsByUser cascade soft-deletes memberships for a user.
func (r *ShopRepository) SoftDeleteMembershipsByUser(ctx context.Context, userID, deletedAt int64) error {
	err := r.db.WithContext(ctx).Model(&ShopMemberModel{}).
		Where("user_id = ? AND deleted_at IS NULL", userID).
		UpdateColumn("deleted_at", deletedAt).Error
	if err != nil {
		return fmt.Errorf("soft-delete memberships by user: %w", err)
	}
	return nil
}

// OwnerIDOfShop returns the owner of a shop. It is required by the product
// feature's ShopProductStore seam.
func (r *ShopRepository) OwnerIDOfShop(ctx context.Context, shopID int64) (int64, error) {
	var model ShopModel
	err := r.db.WithContext(ctx).Model(&ShopModel{}).
		Select("owner_id").Where("id = ? AND deleted_at IS NULL", shopID).Take(&model).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return 0, shopdomain.ErrShopNotFound
		}
		return 0, fmt.Errorf("resolve shop owner: %w", err)
	}
	return model.OwnerID, nil
}

// ShopsByProduct returns the shops a product is linked to (product feature
// seam).
func (r *ShopRepository) ShopsByProduct(ctx context.Context, productID int64) ([]productdomain.ShopLink, error) {
	var rows []struct {
		ShopID   int64  `gorm:"column:shop_id"`
		ShopName string `gorm:"column:shop_name"`
		OwnerID  int64  `gorm:"column:owner_id"`
		Price    *int64 `gorm:"column:price"`
		Stock    int    `gorm:"column:stock"`
	}
	err := r.db.WithContext(ctx).
		Table("shop_products sp").
		Select("sp.shop_id AS shop_id, s.name AS shop_name, s.owner_id AS owner_id, sp.price, sp.stock").
		Joins("JOIN shops s ON s.id = sp.shop_id").
		Where("sp.product_id = ? AND sp.deleted_at IS NULL AND s.deleted_at IS NULL", productID).
		Scan(&rows).Error
	if err != nil {
		return nil, fmt.Errorf("list product shops: %w", err)
	}

	out := make([]productdomain.ShopLink, 0, len(rows))
	for i := range rows {
		out = append(out, productdomain.ShopLink{
			ShopID:   rows[i].ShopID,
			ShopName: rows[i].ShopName,
			OwnerID:  rows[i].OwnerID,
			Price:    rows[i].Price,
			Stock:    rows[i].Stock,
		})
	}
	return out, nil
}

// LinkProduct inserts or updates a product-to-shop link.
func (r *ShopRepository) LinkProduct(ctx context.Context, productID, shopID int64, price *int64, stock int) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var model ShopProductModel
		err := tx.Model(&ShopProductModel{}).
			Where("product_id = ? AND shop_id = ?", productID, shopID).
			Order("id DESC").
			First(&model).Error
		if err == nil {
			return tx.Model(&ShopProductModel{}).
				Where("product_id = ? AND shop_id = ?", productID, shopID).
				UpdateColumns(map[string]any{
					"price":      price,
					"stock":      stock,
					"deleted_at": nil,
				}).Error
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		return tx.Create(&ShopProductModel{
			ShopID: shopID, ProductID: productID,
			Price: price, Stock: stock,
			CreatedAt: timeNowMillis(),
		}).Error
	})
}

// UnlinkProduct soft-deletes a product-to-shop link.
func (r *ShopRepository) UnlinkProduct(ctx context.Context, productID, shopID int64) error {
	err := r.db.WithContext(ctx).Model(&ShopProductModel{}).
		Where("product_id = ? AND shop_id = ? AND deleted_at IS NULL", productID, shopID).
		UpdateColumn("deleted_at", timeNowMillis()).Error
	return err
}

func timeNowMillis() int64 {
	return time.Now().UnixMilli()
}
