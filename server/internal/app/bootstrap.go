// Package app wires the application together and owns the startup bootstrap:
// configuration, logger, database, repositories, usecases, handlers and routes.
package app

import (
	"context"
	"time"

	"github.com/gofiber/fiber/v2"

	"github.com/prakasa1904/ai-commerce/internal/config"
	"github.com/prakasa1904/ai-commerce/internal/platform/crypto"
	"github.com/prakasa1904/ai-commerce/internal/platform/database"
	"github.com/prakasa1904/ai-commerce/internal/platform/logger"
	platformv "github.com/prakasa1904/ai-commerce/internal/platform/validator"
	"github.com/prakasa1904/ai-commerce/internal/shared/jwt"

	userhttp "github.com/prakasa1904/ai-commerce/internal/features/user/delivery/http"
	userrepo "github.com/prakasa1904/ai-commerce/internal/features/user/repository"
	usercase "github.com/prakasa1904/ai-commerce/internal/features/user/usecase"

	shophttp "github.com/prakasa1904/ai-commerce/internal/features/shop/delivery/http"
	shoprepo "github.com/prakasa1904/ai-commerce/internal/features/shop/repository"
	shopcase "github.com/prakasa1904/ai-commerce/internal/features/shop/usecase"

	producthttp "github.com/prakasa1904/ai-commerce/internal/features/product/delivery/http"
	productrepo "github.com/prakasa1904/ai-commerce/internal/features/product/repository"
	productcase "github.com/prakasa1904/ai-commerce/internal/features/product/usecase"

	adminhttp "github.com/prakasa1904/ai-commerce/internal/features/admin/delivery/http"
	adminrepo "github.com/prakasa1904/ai-commerce/internal/features/admin/repository"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

// PasswordHasher adapts the platform crypto package to the user usecase seam.
type PasswordHasher struct{}

// Hash hashes a plaintext password with bcrypt.
func (PasswordHasher) Hash(plaintext string) (string, error) {
	return crypto.HashPassword(plaintext)
}

// Compare reports whether a plaintext matches a bcrypt hash.
func (PasswordHasher) Compare(plaintext, hash string) bool {
	return crypto.ComparePassword(plaintext, hash)
}

// relationshipsCleaner satisfies the user usecase RelationshipsCleaner by
// delegating the cross-feature cascade soft-deletes to the owning repositories.
type relationshipsCleaner struct {
	shops    *shoprepo.ShopRepository
	products *productrepo.ProductRepository
}

// SoftDeleteShopsByOwner cascade-removes a seller's shops.
func (c relationshipsCleaner) SoftDeleteShopsByOwner(ctx context.Context, ownerID, deletedAt int64) error {
	return c.shops.SoftDeleteShopsByOwner(ctx, ownerID, deletedAt)
}

// SoftDeleteProductsByOwner cascade-removes a seller's products.
func (c relationshipsCleaner) SoftDeleteProductsByOwner(ctx context.Context, ownerID, deletedAt int64) error {
	return c.products.SoftDeleteByOwner(ctx, ownerID, deletedAt)
}

// SoftDeleteMembershipsByUser cascade-removes a user's memberships.
func (c relationshipsCleaner) SoftDeleteMembershipsByUser(ctx context.Context, userID, deletedAt int64) error {
	return c.shops.SoftDeleteMembershipsByUser(ctx, userID, deletedAt)
}

// Dependencies bundles the objects the API needs to serve traffic.
type Dependencies struct {
	App    *fiber.App
	Signer *jwt.Signer
	DB     *gorm.DB
	Logger *zap.Logger
}

// Bootstrap builds the application: config, logger, database, migrations, all
// repositories, usecases, handlers and routes.
func Bootstrap(cfg config.Config) (*Dependencies, error) {
	log, err := logger.NewLogger(cfg.AppEnv)
	if err != nil {
		return nil, err
	}

	db, err := database.NewSQLiteDB(cfg.DBPath, log)
	if err != nil {
		return nil, err
	}

	if err := Migrate(db, log); err != nil {
		return nil, err
	}
	if err := LegacyFixes(db, log); err != nil {
		return nil, err
	}
	if err := Seed(db); err != nil {
		log.Warn("seed failed", zap.Error(err))
	}

	userRepo := userrepo.NewUserRepository(db, log)
	shopRepo := shoprepo.NewShopRepository(db, log)
	productRepo := productrepo.NewProductRepository(db, log)
	statsRepo := adminrepo.NewGormStatsCollector(db, log)

	signer := jwt.NewSigner(cfg.JWTSecret, jwtExpiry(cfg.JWTExpiresIn))
	validator := platformv.NewValidator()
	cleaner := relationshipsCleaner{shops: shopRepo, products: productRepo}

	userCase := usercase.NewUserUsecase(userRepo, cleaner, signer, PasswordHasher{}, log)
	shopCase := shopcase.NewShopUsecase(shopRepo, log)
	productCase := productcase.NewProductUsecase(productRepo, shopRepo)

	app := fiber.New()

	userhttp.RegisterAuthRoutes(app, userhttp.NewUserAuthHandler(userCase, shopCase, validator, log), signer)
	userhttp.RegisterUserAdminRoutes(app, userhttp.NewUserAdminHandler(userCase, validator), signer)

	shophttp.RegisterShopAdminRoutes(app, shophttp.NewShopAdminHandler(shopCase, validator), signer)
	producthttp.RegisterPublicRoutes(app, producthttp.NewProductHandler(productCase, validator))
	producthttp.RegisterProductAdminRoutes(app, producthttp.NewProductHandler(productCase, validator), signer)
	adminhttp.RegisterAdminRoutes(app, statsRepo, signer)

	return &Dependencies{App: app, Signer: signer, DB: db, Logger: log}, nil
}

// jwtExpiry parses a duration string such as "7d" into a time.Duration. The
// fallback is seven days.
func jwtExpiry(raw string) time.Duration {
	switch raw {
	case "1h":
		return time.Hour
	case "24h":
		return 24 * time.Hour
	default:
		return 7 * 24 * time.Hour
	}
}
