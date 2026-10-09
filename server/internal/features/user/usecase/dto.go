package usecase

import (
	"context"

	"github.com/prakasa1904/ai-commerce/internal/features/user/domain"
	"github.com/prakasa1904/ai-commerce/internal/shared/jwt"
)

// RegisterInput is the validated public input for registration.
type RegisterInput struct {
	Username string
	Name     string
	Email    string
	Password string
	Role     domain.Role
	IsAdmin  bool
}

// CreateUserInput mirrors registration input for the admin console.
type CreateUserInput = RegisterInput

// LoginInput is the validated public input for login.
type LoginInput struct {
	Email    string
	Password string
}

// UpdateUserInput holds the admin-updatable fields.
type UpdateUserInput struct {
	Username string
	Name     string
	Email    string
	Role     domain.Role
	IsAdmin  bool
}

// Session is returned to clients after a successful authentication.
type Session struct {
	User  domain.UserPublic `json:"user"`
	Token string            `json:"token"`
}

// TokenSigner is the seam for issuing JWTs (implemented by shared/jwt).
type TokenSigner interface {
	Sign(*jwt.Claims) (string, error)
}

// PasswordHasher abstracts bcrypt hashing and checking.
type PasswordHasher interface {
	Hash(plaintext string) (string, error)
	Compare(plaintext, hash string) bool
}

// ListUsersOptions controls the admin user listing.
type ListUsersOptions struct {
	Query          string
	IncludeDeleted bool
}

// UserRepository is the persistence port used by the user usecase.
type UserRepository interface {
	FindActiveByEmail(ctx context.Context, email string) (*domain.User, error)
	FindActiveByID(ctx context.Context, id int64) (*domain.User, error)
	EmailTaken(ctx context.Context, email string) (bool, error)
	CountActive(ctx context.Context) (int64, error)
	List(ctx context.Context, includeDeleted bool, query string) ([]domain.User, error)
	Create(ctx context.Context, user *domain.User) (*domain.User, error)
	SetPartials(ctx context.Context, id int64, fields map[string]any, updatedAt int64) (*domain.User, error)
	SoftDelete(ctx context.Context, id int64, deletedAt int64) error
	Restore(ctx context.Context, id int64, updatedAt int64) error
}

// RelationshipsCleaner groups the cross-feature soft-delete operations needed
// to cascade a user removal. It is implemented by the shop and product
// repositories at bootstrap time.
type RelationshipsCleaner interface {
	SoftDeleteShopsByOwner(ctx context.Context, ownerID, deletedAt int64) error
	SoftDeleteProductsByOwner(ctx context.Context, ownerID, deletedAt int64) error
	SoftDeleteMembershipsByUser(ctx context.Context, userID, deletedAt int64) error
}
