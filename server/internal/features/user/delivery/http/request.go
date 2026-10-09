package http

import (
	usersdomain "github.com/prakasa1904/ai-commerce/internal/features/user/domain"
)

// validator is the minimal seam the handler needs for payload validation.
type validator interface {
	ValidateStruct(any) error
}

// RegisterRequest is the validated payload for post /api/auth/register.
type RegisterRequest struct {
	Username string           `json:"username" validate:"required,min=2,max=50"`
	Email    string           `json:"email" validate:"required,email,max=255"`
	Password string           `json:"password" validate:"required,min=6,max=128"`
	Role     usersdomain.Role `json:"role"`
	IsAdmin  bool             `json:"isAdmin"`
}

// LoginRequest is the validated payload for post /api/auth/login.
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email,max=255"`
	Password string `json:"password" validate:"required,min=6,max=128"`
}

// CreateUserRequest is the admin-console payload for creating a user.
type CreateUserRequest struct {
	Username string           `json:"username" validate:"required,min=2,max=50"`
	Name     string           `json:"name" validate:"max=100"`
	Email    string           `json:"email" validate:"required,email,max=255"`
	Password string           `json:"password" validate:"required,min=6,max=128"`
	Role     usersdomain.Role `json:"role"`
	IsAdmin  bool             `json:"isAdmin"`
}

// UpdateUserRequest is the admin-console payload for updating a user.
type UpdateUserRequest struct {
	Username string           `json:"username" validate:"omitempty,min=2,max=50"`
	Name     string           `json:"name" validate:"omitempty,max=100"`
	Email    string           `json:"email" validate:"omitempty,email,max=255"`
	Role     usersdomain.Role `json:"role"`
	IsAdmin  bool             `json:"isAdmin"`
}
