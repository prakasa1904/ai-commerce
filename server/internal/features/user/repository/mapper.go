package repository

import (
	"github.com/prakasa1904/ai-commerce/internal/features/user/domain"
)

// toDomainUser converts a persistence model to its domain entity.
func toDomainUser(model UserModel) domain.User {
	return domain.User{
		ID:        model.ID,
		Username:  model.Username,
		Name:      model.Name,
		Email:     model.Email,
		Role:      domain.Role(model.Role),
		IsAdmin:   model.IsAdmin == 1,
		Password:  model.Password,
		CreatedAt: model.CreatedAt,
		UpdatedAt: model.UpdatedAt,
		DeletedAt: model.DeletedAt,
	}
}

// toUserModel converts a domain entity to its persistence model.
func toUserModel(user domain.User) UserModel {
	return UserModel{
		ID:        user.ID,
		Username:  user.Username,
		Name:      user.Name,
		Email:     user.Email,
		Password:  user.Password,
		Role:      string(user.Role),
		IsAdmin:   adminFlag(user.IsAdmin),
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
		DeletedAt: user.DeletedAt,
	}
}

// adminFlag converts the boolean domain flag to the integer row value.
func adminFlag(b bool) int {
	if b {
		return 1
	}
	return 0
}
