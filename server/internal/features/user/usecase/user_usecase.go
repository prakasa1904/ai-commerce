package usecase

import (
	"context"
	"fmt"
	"strings"

	"github.com/prakasa1904/ai-commerce/internal/features/user/domain"
	sharederrors "github.com/prakasa1904/ai-commerce/internal/shared/errors"
	"github.com/prakasa1904/ai-commerce/internal/shared/jwt"
	"go.uber.org/zap"
)

// UserUsecase is the application service for user related operations: public
// registration/login plus the admin console user CRUD.
type UserUsecase struct {
	users     UserRepository
	cleaner   RelationshipsCleaner
	token     TokenSigner
	passwords PasswordHasher
	logger    *zap.Logger
}

// NewUserUsecase assembles the user application service.
func NewUserUsecase(
	users UserRepository,
	cleaner RelationshipsCleaner,
	token TokenSigner,
	passwords PasswordHasher,
	logger *zap.Logger,
) *UserUsecase {
	return &UserUsecase{
		users:     users,
		cleaner:   cleaner,
		token:     token,
		passwords: passwords,
		logger:    logger,
	}
}

// Register creates a new marketplace account and returns a session token.
func (u *UserUsecase) Register(ctx context.Context, input RegisterInput) (Session, error) {
	email := normalizeEmail(input.Email)
	username := strings.TrimSpace(input.Username)
	name := strings.TrimSpace(input.Name)
	if name == "" {
		name = username
	}
	role := input.Role
	if role == "" {
		role = domain.RoleBuyer
	}

	taken, err := u.users.EmailTaken(ctx, email)
	if err != nil {
		return Session{}, fmt.Errorf("check email availability: %w", err)
	}
	if taken {
		return Session{}, domain.ErrEmailExists
	}

	hash, err := u.passwords.Hash(input.Password)
	if err != nil {
		u.logger.Error("failed to hash password",
			zap.String("email", email), zap.Error(err))
		return Session{}, fmt.Errorf("create account: %w", err)
	}

	now := domain.TimeMillis()
	created, err := u.users.Create(ctx, &domain.User{
		Username:  username,
		Name:      name,
		Email:     email,
		Password:  hash,
		Role:      role,
		CreatedAt: now,
		UpdatedAt: now,
	})
	if err != nil {
		u.logger.Error("failed to create user",
			zap.String("email", email), zap.Error(err))
		return Session{}, fmt.Errorf("create account: %w", err)
	}

	token, err := u.token.Sign(claimsOf(created))
	if err != nil {
		u.logger.Error("failed to sign session token", zap.Error(err))
		return Session{}, fmt.Errorf("sign session: %w", err)
	}

	return Session{User: created.Sanitize().ToPublic(), Token: token}, nil
}

// Login verifies credentials and returns a session token.
func (u *UserUsecase) Login(ctx context.Context, input LoginInput) (Session, error) {
	user, err := u.users.FindActiveByEmail(ctx, normalizeEmail(input.Email))
	if err != nil {
		return Session{}, domain.ErrInvalidCredentials
	}
	if !u.passwords.Compare(input.Password, user.Password) {
		return Session{}, domain.ErrInvalidCredentials
	}

	token, err := u.token.Sign(claimsOf(user))
	if err != nil {
		u.logger.Error("failed to sign session token", zap.Error(err))
		return Session{}, fmt.Errorf("sign session: %w", err)
	}

	return Session{User: user.Sanitize().ToPublic(), Token: token}, nil
}

// Me returns the public profile of the authenticated user.
func (u *UserUsecase) Me(ctx context.Context, claims *jwt.Claims) (*domain.UserPublic, error) {
	user, err := u.users.FindActiveByID(ctx, claims.ID)
	if err != nil {
		return nil, err
	}
	public := user.Sanitize().ToPublic()
	return &public, nil
}

// ListUsers returns the admin user listing, optionally including soft-deleted
// rows for platform admins.
func (u *UserUsecase) ListUsers(ctx context.Context, opts ListUsersOptions) ([]domain.UserPublic, error) {
	users, err := u.users.List(ctx, opts.IncludeDeleted, opts.Query)
	if err != nil {
		return nil, err
	}

	public := make([]domain.UserPublic, 0, len(users))
	for i := range users {
		public = append(public, users[i].Sanitize().ToPublic())
	}
	return public, nil
}

// GetUser returns a single public user profile.
func (u *UserUsecase) GetUser(ctx context.Context, actorIsAdmin bool, id int64) (*domain.UserPublic, error) {
	if !actorIsAdmin {
		return nil, sharederrors.ErrForbidden
	}
	user, err := u.users.FindActiveByID(ctx, id)
	if err != nil {
		return nil, err
	}
	public := user.Sanitize().ToPublic()
	return &public, nil
}

// CreateUser registers a new account through the admin console.
func (u *UserUsecase) CreateUser(ctx context.Context, actorIsAdmin bool, input CreateUserInput) (*domain.UserPublic, error) {
	if !actorIsAdmin {
		return nil, sharederrors.ErrForbidden
	}

	taken, err := u.users.EmailTaken(ctx, input.Email)
	if err != nil {
		return nil, fmt.Errorf("check email availability: %w", err)
	}
	if taken {
		return nil, domain.ErrEmailExists
	}

	hash, err := u.passwords.Hash(input.Password)
	if err != nil {
		u.logger.Error("failed to hash password",
			zap.String("email", input.Email), zap.Error(err))
		return nil, fmt.Errorf("create user: %w", err)
	}

	now := domain.TimeMillis()
	created, err := u.users.Create(ctx, &domain.User{
		Username:  input.Username,
		Name:      input.Name,
		Email:     input.Email,
		Password:  hash,
		Role:      input.Role,
		IsAdmin:   input.IsAdmin,
		CreatedAt: now,
		UpdatedAt: now,
	})
	if err != nil {
		u.logger.Error("failed to create user",
			zap.String("email", input.Email), zap.Error(err))
		return nil, fmt.Errorf("create user: %w", err)
	}

	public := created.Sanitize().ToPublic()
	return &public, nil
}

// UpdateUser applies admin changes to a user.
func (u *UserUsecase) UpdateUser(ctx context.Context, actorIsAdmin bool, id int64, input UpdateUserInput) (*domain.UserPublic, error) {
	if !actorIsAdmin {
		return nil, sharederrors.ErrForbidden
	}

	fields := map[string]any{}
	if input.Username != "" {
		fields["username"] = input.Username
	}
	if input.Name != "" {
		fields["name"] = input.Name
	}
	if input.Email != "" {
		fields["email"] = normalizeEmail(input.Email)
	}
	if input.Role != "" {
		fields["role"] = string(input.Role)
	}
	fields["is_admin"] = adminFlag(input.IsAdmin)

	user, err := u.users.SetPartials(ctx, id, fields, domain.TimeMillis())
	if err != nil {
		return nil, err
	}

	public := user.Sanitize().ToPublic()
	return &public, nil
}

// SoftDeleteUser cascade-removes a user and records that belong to them. It is
// reserved for platform admins.
func (u *UserUsecase) SoftDeleteUser(ctx context.Context, actorIsAdmin bool, id int64) error {
	if !actorIsAdmin {
		return sharederrors.ErrForbidden
	}

	now := domain.TimeMillis()
	if err := u.cleaner.SoftDeleteShopsByOwner(ctx, id, now); err != nil {
		return fmt.Errorf("soft-delete user shops: %w", err)
	}
	if err := u.cleaner.SoftDeleteProductsByOwner(ctx, id, now); err != nil {
		return fmt.Errorf("soft-delete user products: %w", err)
	}
	if err := u.cleaner.SoftDeleteMembershipsByUser(ctx, id, now); err != nil {
		return fmt.Errorf("soft-delete user memberships: %w", err)
	}

	if err := u.users.SoftDelete(ctx, id, now); err != nil {
		return err
	}
	return nil
}

// RestoreUser undoes a soft delete.
func (u *UserUsecase) RestoreUser(ctx context.Context, actorIsAdmin bool, id int64) error {
	if !actorIsAdmin {
		return sharederrors.ErrForbidden
	}
	return u.users.Restore(ctx, id, domain.TimeMillis())
}

func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

func claimsOf(user *domain.User) *jwt.Claims {
	return &jwt.Claims{
		ID:       user.ID,
		Username: user.Username,
		Email:    user.Email,
		Role:     string(user.Role),
		IsAdmin:  user.IsAdmin,
	}
}

func adminFlag(b bool) int {
	if b {
		return 1
	}
	return 0
}
