package repository

// UserModel is the GORM persistence model for a marketplace account. It
// mirrors the legacy schema so existing SQLite data can be migrated forward.
type UserModel struct {
	ID        int64  `gorm:"primaryKey;column:id"`
	Username  string `gorm:"column:username"`
	Name      string `gorm:"column:name"`
	Email     string `gorm:"uniqueIndex;column:email"`
	Password  string `gorm:"column:password"`
	Role      string `gorm:"column:role"`
	IsAdmin   int    `gorm:"column:is_admin"`
	CreatedAt int64  `gorm:"column:created_at"`
	UpdatedAt int64  `gorm:"column:updated_at"`
	DeletedAt *int64 `gorm:"column:deleted_at"`
}

// TableName keeps the model aligned with the legacy users table.
func (UserModel) TableName() string {
	return "users"
}
