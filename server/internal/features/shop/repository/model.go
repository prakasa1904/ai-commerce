package repository

// ShopModel is the GORM persistence model for a seller storefront. It mirrors
// the legacy schema so existing SQLite data can be migrated forward.
type ShopModel struct {
	ID          int64  `gorm:"primaryKey;column:id"`
	OwnerID     int64  `gorm:"column:owner_id"`
	Name        string `gorm:"column:name"`
	Description string `gorm:"column:description"`
	Website     string `gorm:"column:website"`
	Phone       string `gorm:"column:phone"`
	Email       string `gorm:"column:email"`
	Address     string `gorm:"column:address"`
	Employees   string `gorm:"column:employees"`
	CreatedAt   int64  `gorm:"column:created_at"`
	UpdatedAt   int64  `gorm:"column:updated_at"`
	DeletedAt   *int64 `gorm:"column:deleted_at"`
	// Transient scan targets populated by qualified SQL queries.
	OwnerName string `gorm:"-"`
}

// TableName keeps the model aligned with the legacy shops table.
func (ShopModel) TableName() string {
	return "shops"
}

// ShopMemberModel is the GORM persistence model for a shop membership join.
type ShopMemberModel struct {
	ID        int64  `gorm:"primaryKey;column:id"`
	ShopID    int64  `gorm:"column:shop_id"`
	UserID    int64  `gorm:"column:user_id"`
	Role      string `gorm:"column:role"`
	CreatedAt int64  `gorm:"column:created_at"`
	DeletedAt *int64 `gorm:"column:deleted_at"`
	// Transient scan targets populated by JOIN queries.
	Username string `gorm:"-"`
	Name     string `gorm:"-"`
	Email    string `gorm:"-"`
}

// TableName keeps the model aligned with the legacy shop_members table.
func (ShopMemberModel) TableName() string {
	return "shop_members"
}

// ShopProductModel is the GORM persistence model for the shop/products join.
type ShopProductModel struct {
	ID        int64  `gorm:"primaryKey;column:id"`
	ShopID    int64  `gorm:"column:shop_id"`
	ProductID int64  `gorm:"column:product_id"`
	Price     *int64 `gorm:"column:price"`
	Stock     int    `gorm:"column:stock"`
	CreatedAt int64  `gorm:"column:created_at"`
	DeletedAt *int64 `gorm:"column:deleted_at"`
}

// TableName keeps the model aligned with the legacy shop_products join table.
func (ShopProductModel) TableName() string {
	return "shop_products"
}
