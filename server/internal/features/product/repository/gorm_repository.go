package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/prakasa1904/ai-commerce/internal/features/product/domain"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// ProductRepository persists and queries products with GORM.
type ProductRepository struct {
	db     *gorm.DB
	logger *zap.Logger
}

// NewProductRepository builds a repository backed by the given connection.
func NewProductRepository(db *gorm.DB, logger *zap.Logger) *ProductRepository {
	return &ProductRepository{db: db, logger: logger}
}

// List returns the admin listing. ownerID == 0 means any owner.
func (r *ProductRepository) List(ctx context.Context, ownerID int64, includeDeleted bool, query string) ([]domain.Product, error) {
	stmt := r.db.WithContext(ctx).Model(&ProductModel{}).
		Select("products.*, (SELECT COUNT(*) FROM shop_products sp WHERE sp.product_id = products.id AND sp.deleted_at IS NULL) AS shop_count, u.username AS owner_name").
		Joins("LEFT JOIN users u ON u.id = products.owner_id").
		Order("products.id DESC")

	if ownerID != 0 {
		stmt = stmt.Where("products.owner_id = ?", ownerID)
	}
	if !includeDeleted {
		stmt = stmt.Where("products.deleted_at IS NULL")
	}
	if query != "" {
		pattern := "%" + query + "%"
		stmt = stmt.Where("products.title LIKE ? OR products.description LIKE ?", pattern, pattern)
	}

	var models []ProductModel
	if err := stmt.Scan(&models).Error; err != nil {
		return nil, fmt.Errorf("list products: %w", err)
	}

	products := make([]domain.Product, 0, len(models))
	for i := range models {
		products = append(products, toDomainProduct(models[i]))
	}
	return products, nil
}

// ListPublic returns the non-deleted catalog.
func (r *ProductRepository) ListPublic(ctx context.Context) ([]domain.PublicProduct, error) {
	var models []ProductModel
	err := r.db.WithContext(ctx).Model(&ProductModel{}).
		Where("deleted_at IS NULL").
		Order("id DESC").
		Select("id, title, description, price, imageUrl, category, wholesale").
		Find(&models).Error
	if err != nil {
		return nil, err
	}
	items := make([]domain.PublicProduct, 0, len(models))
	for i := range models {
		items = append(items, toPublicProduct(toDomainProduct(models[i])))
	}
	return items, nil
}

// Get returns one non-deleted product or a domain error.
func (r *ProductRepository) Get(ctx context.Context, id int64) (*domain.Product, error) {
	var model ProductModel
	err := r.db.WithContext(ctx).
		Model(&ProductModel{}).
		Select("products.*, (SELECT COUNT(*) FROM shop_products sp WHERE sp.product_id = products.id AND sp.deleted_at IS NULL) AS shop_count, u.username AS owner_name").
		Joins("LEFT JOIN users u ON u.id = products.owner_id").
		Where("products.id = ? AND products.deleted_at IS NULL", id).
		Scan(&model).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrProductNotFound
		}
		return nil, fmt.Errorf("get product %d: %w", id, err)
	}
	p := toDomainProduct(model)
	return &p, nil
}

// Create inserts a product owned by ownerID.
func (r *ProductRepository) Create(ctx context.Context, ownerID int64, p domain.Product) (*domain.Product, error) {
	model := toProductModel(p)
	if ownerID != 0 {
		model.OwnerID = ownerID
	}
	if err := r.db.WithContext(ctx).Create(&model).Error; err != nil {
		return nil, fmt.Errorf("create product: %w", err)
	}
	p.ID = model.ID
	return &p, nil
}

// Update applies partial updates to a product.
func (r *ProductRepository) Update(ctx context.Context, id int64, fields map[string]any, updatedAt int64) (*domain.Product, error) {
	if len(fields) == 0 {
		return r.Get(ctx, id)
	}
	fields["updated_at"] = updatedAt
	if err := r.db.WithContext(ctx).Model(&ProductModel{}).Where("id = ?", id).Updates(fields).Error; err != nil {
		return nil, fmt.Errorf("update product %d: %w", id, err)
	}
	return r.Get(ctx, id)
}

// SoftDelete removes a product and its shop links.
func (r *ProductRepository) SoftDelete(ctx context.Context, id, deletedAt int64) error {
	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&ProductModel{}).Where("id = ?", id).UpdateColumns(map[string]any{
			"deleted_at": deletedAt,
			"updated_at": deletedAt,
		}).Error; err != nil {
			return err
		}
		// Defer join cleanup to the shop repository's link table.
		return nil
	})
	return err
}

// Restore clears a product's deleted flag.
func (r *ProductRepository) Restore(ctx context.Context, id, updatedAt int64) error {
	err := r.db.WithContext(ctx).Model(&ProductModel{}).Where("id = ?", id).
		UpdateColumns(map[string]any{"deleted_at": nil, "updated_at": updatedAt}).Error
	return err
}

// SoftDeleteByOwner soft-deletes every non-deleted product of an owner. It is
// used by the user relationships cleaner when an account is removed.
func (r *ProductRepository) SoftDeleteByOwner(ctx context.Context, ownerID, deletedAt int64) error {
	err := r.db.WithContext(ctx).Model(&ProductModel{}).
		Where("owner_id = ? AND deleted_at IS NULL", ownerID).
		UpdateColumns(map[string]any{
			"deleted_at": deletedAt,
			"updated_at": deletedAt,
		}).Error
	if err != nil {
		return fmt.Errorf("soft-delete products by owner: %w", err)
	}
	return nil
}
