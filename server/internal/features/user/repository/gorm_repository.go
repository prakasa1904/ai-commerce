package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/prakasa1904/ai-commerce/internal/features/user/domain"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// UserRepository persists and queries users.
type UserRepository struct {
	db     *gorm.DB
	logger *zap.Logger
}

// NewUserRepository builds a repository backed by the given connection.
func NewUserRepository(db *gorm.DB, logger *zap.Logger) *UserRepository {
	return &UserRepository{db: db, logger: logger}
}

// FindActiveByEmail returns a user with email and not soft-deleted.
func (r *UserRepository) FindActiveByEmail(ctx context.Context, email string) (*domain.User, error) {
	var model UserModel
	err := r.db.WithContext(ctx).
		Where("email = ? AND deleted_at IS NULL", email).
		Take(&model).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrUserNotFound
		}
		r.logger.Error("failed to find user by email",
			zap.String("email", email), zap.Error(err))
		return nil, fmt.Errorf("find user by email %s: %w", email, err)
	}

	user := toDomainUser(model)
	return &user, nil
}

// FindActiveByID returns a user by id when it exists and is not soft-deleted.
func (r *UserRepository) FindActiveByID(ctx context.Context, id int64) (*domain.User, error) {
	var model UserModel
	err := r.db.WithContext(ctx).
		Where("id = ? AND deleted_at IS NULL", id).
		Take(&model).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrUserNotFound
		}
		r.logger.Error("failed to find user by id",
			zap.Int64("user_id", id), zap.Error(err))
		return nil, fmt.Errorf("find user by id %d: %w", id, err)
	}

	user := toDomainUser(model)
	return &user, nil
}

// CountActive returns the number of active (not soft-deleted) users.
func (r *UserRepository) CountActive(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&UserModel{}).
		Where("deleted_at IS NULL").
		Count(&count).Error
	return count, err
}

// CountAll returns the number of users regardless of deleted_at state.
func (r *UserRepository) CountAll(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&UserModel{}).
		Count(&count).Error
	return count, err
}

// EmailTaken reports whether email is already in use by any live user.
func (r *UserRepository) EmailTaken(ctx context.Context, email string) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&UserModel{}).
		Where("email = ?", email).
		Count(&count).Error
	return count > 0, err
}

// Create inserts a new user and returns it.
func (r *UserRepository) Create(ctx context.Context, user *domain.User) (*domain.User, error) {
	model := toUserModel(*user)
	if err := r.db.WithContext(ctx).Create(&model).Error; err != nil {
		r.logger.Error("failed to create user",
			zap.Int64("user_id", user.ID), zap.Error(err))
		return nil, fmt.Errorf("create user %s: %w", user.Email, err)
	}
	user.ID = model.ID
	return user, nil
}

// SetPartials applies the given partial columns to an existing user and
// returns the refreshed row.
func (r *UserRepository) SetPartials(ctx context.Context, id int64, fields map[string]any, updatedAt int64) (*domain.User, error) {
	if len(fields) == 0 {
		return r.FindActiveByID(ctx, id)
	}

	stmt := r.db.WithContext(ctx).
		Model(&UserModel{}).
		Where("id = ?", id)

	for column, value := range fields {
		stmt = stmt.UpdateColumn(column, value)
	}

	if err := stmt.Error; err != nil {
		r.logger.Error("failed to update user",
			zap.Int64("user_id", id),
			zap.Any("fields", fields), zap.Error(err))
		return nil, fmt.Errorf("update user %d: %w", id, err)
	}

	return r.FindActiveByID(ctx, id)
}

// SoftDelete marks a user as deleted.
func (r *UserRepository) SoftDelete(ctx context.Context, id int64, deletedAt int64) error {
	err := r.db.WithContext(ctx).
		Model(&UserModel{}).
		Where("id = ?", id).
		UpdateColumns(map[string]any{
			"deleted_at": deletedAt,
			"updated_at": deletedAt,
		}).Error

	if err != nil {
		r.logger.Error("failed to soft-delete user",
			zap.Int64("user_id", id), zap.Error(err))
		return fmt.Errorf("soft-delete user %d: %w", id, err)
	}
	return nil
}

// Restore clears the deleted_at marker of a user.
func (r *UserRepository) Restore(ctx context.Context, id int64, updatedAt int64) error {
	err := r.db.WithContext(ctx).
		Model(&UserModel{}).
		Where("id = ?", id).
		UpdateColumns(map[string]any{
			"deleted_at": nil,
			"updated_at": updatedAt,
		}).Error

	if err != nil {
		r.logger.Error("failed to restore user",
			zap.Int64("user_id", id), zap.Error(err))
		return fmt.Errorf("restore user %d: %w", id, err)
	}
	return nil
}

// List implements UserRepository.List by returning users, optionally including
// soft-deleted rows for admins, optionally filtered by a free-text query.
func (r *UserRepository) List(ctx context.Context, includeDeleted bool, query string) ([]domain.User, error) {
	stmt := r.db.WithContext(ctx).Model(&UserModel{}).Order("id DESC")
	if !includeDeleted {
		stmt = stmt.Where("deleted_at IS NULL")
	}
	if query != "" {
		pattern := "%" + query + "%"
		stmt = stmt.Where("username LIKE ? OR email LIKE ? OR name LIKE ?", pattern, pattern, pattern)
	}

	var models []UserModel
	if err := stmt.Find(&models).Error; err != nil {
		return nil, fmt.Errorf("list users: %w", err)
	}

	users := make([]domain.User, 0, len(models))
	for i := range models {
		users = append(users, toDomainUser(models[i]))
	}
	return users, nil
}
