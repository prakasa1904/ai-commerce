package app

import (
	productrepo "github.com/prakasa1904/ai-commerce/internal/features/product/repository"
	"github.com/prakasa1904/ai-commerce/internal/features/shop/repository"
	userrepo "github.com/prakasa1904/ai-commerce/internal/features/user/repository"
	"github.com/prakasa1904/ai-commerce/internal/platform/database"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// Migrate runs GORM auto-migration for every known table.
func Migrate(db *gorm.DB, log *zap.Logger) error {
	if err := database.AutoMigrate(
		db,
		&productrepo.ProductModel{},
		&userrepo.UserModel{},
		&repository.ShopModel{},
		&repository.ShopMemberModel{},
		&repository.ShopProductModel{},
	); err != nil {
		log.Error("database migration failed", zap.Error(err))
		return err
	}
	return nil
}
