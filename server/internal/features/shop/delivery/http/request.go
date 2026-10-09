package http

import shopdomain "github.com/prakasa1904/ai-commerce/internal/features/shop/domain"

// CreateShopRequest is the validated shop creation payload.
type CreateShopRequest struct {
	Name        string `json:"name" validate:"required,min=2,max=100"`
	Description string `json:"description" validate:"max=500"`
	Website     string `json:"website" validate:"omitempty,url,max=255"`
	Phone       string `json:"phone" validate:"omitempty,max=50"`
	Email       string `json:"email" validate:"omitempty,email,max=255"`
	Address     string `json:"address" validate:"max=255"`
	Employees   string `json:"employees" validate:"max=100"`
}

// UpdateShopRequest carries optional, partial shop changes.
type UpdateShopRequest struct {
	Name        *string `json:"name" validate:"omitempty,min=2,max=100"`
	Description *string `json:"description" validate:"omitempty,max=500"`
	Website     *string `json:"website" validate:"omitempty,url,max=255"`
	Phone       *string `json:"phone" validate:"omitempty,max=50"`
	Email       *string `json:"email" validate:"omitempty,email,max=255"`
	Address     *string `json:"address" validate:"omitempty,max=255"`
	Employees   *string `json:"employees" validate:"omitempty,max=100"`
}

// AddMemberRequest is the payload for joining a user to a shop.
type AddMemberRequest struct {
	UserID int64                     `json:"userId" validate:"required,min=1"`
	Role   shopdomain.MembershipRole `json:"role"`
}

// UpdateMemberRequest is the payload for changing a member's role.
type UpdateMemberRequest struct {
	Role shopdomain.MembershipRole `json:"role" validate:"required"`
}
