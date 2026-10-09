package repository

import (
	"context"

	"github.com/prakasa1904/ai-commerce/internal/features/admin/usecase"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// GormStatsCollector evaluates admin dashboard counts from GORM.
type GormStatsCollector struct {
	db     *gorm.DB
	logger *zap.Logger
}

// NewGormStatsCollector builds a stats collector backed by the given connection.
func NewGormStatsCollector(db *gorm.DB, logger *zap.Logger) *GormStatsCollector {
	return &GormStatsCollector{db: db, logger: logger}
}

func (c *GormStatsCollector) count(ctx context.Context, table string, where string, args ...any) int64 {
	var n int64
	query := c.db.WithContext(ctx).Table(table)
	if where != "" {
		query = query.Where(where, args...)
	}
	err := query.Count(&n).Error
	if err != nil {
		c.logger.Error("failed to count rows", zap.String("table", table), zap.Error(err))
		return 0
	}
	return n
}

// Collect returns the admin counts snapshot.
func (c *GormStatsCollector) Collect(ctx context.Context) (usecase.Stats, error) {
	return usecase.Stats{
		Users:           c.count(ctx, "users", ""),
		ActiveUsers:     c.count(ctx, "users", "deleted_at IS NULL"),
		Shops:           c.count(ctx, "shops", ""),
		Products:        c.count(ctx, "products", ""),
		Memberships:     c.count(ctx, "shop_members", "deleted_at IS NULL"),
		DeletedUsers:    c.count(ctx, "users", "deleted_at IS NOT NULL"),
		DeletedShops:    c.count(ctx, "shops", "deleted_at IS NOT NULL"),
		DeletedProducts: c.count(ctx, "products", "deleted_at IS NOT NULL"),
	}, nil
}
