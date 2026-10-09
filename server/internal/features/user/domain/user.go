package domain

import "time"

// Role distinguishes the marketplace roles a user can hold.
type Role string

const (
	RoleBuyer  Role = "buyer"
	RoleSeller Role = "seller"
)

// MembershipRole distinguishes permissions inside a shop.
type MembershipRole string

const (
	MembershipAdmin    MembershipRole = "admin"
	MembershipNonAdmin MembershipRole = "non_admin"
)

// User is the core business entity for an account.
type User struct {
	ID        int64
	Username  string
	Name      string
	Email     string
	Role      Role
	IsAdmin   bool
	Password  string // bcrypt hash; never exposed
	CreatedAt int64
	UpdatedAt int64
	DeletedAt *int64
}

// Sanitize removes security-sensitive fields before the user crosses an
// application boundary (HTTP response, token payload).
func (u User) Sanitize() User {
	u.Password = ""
	return u
}

// UserPublic is the read-only projection used in responses and shared
// contexts.
type UserPublic struct {
	ID        int64  `json:"id"`
	Username  string `json:"username"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Role      Role   `json:"role"`
	IsAdmin   bool   `json:"isAdmin"`
	CreatedAt int64  `json:"createdAt"`
	UpdatedAt int64  `json:"updatedAt"`
	DeletedAt *int64 `json:"deletedAt"`
}

// ToPublic converts a full user to its public projection.
func (u User) ToPublic() UserPublic {
	return UserPublic{
		ID:        u.ID,
		Username:  u.Username,
		Name:      u.Name,
		Email:     u.Email,
		Role:      u.Role,
		IsAdmin:   u.IsAdmin,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
		DeletedAt: u.DeletedAt,
	}
}

// TimeMillis returns the current wall-clock time in epoch milliseconds,
// matching the schedule used by the existing database.
func TimeMillis() int64 {
	return time.Now().UnixMilli()
}
