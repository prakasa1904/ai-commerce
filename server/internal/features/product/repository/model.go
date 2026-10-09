package repository

// ProductModel persists a sellable marketplace product.
type ProductModel struct {
	ID          int64  `gorm:"primaryKey;column:id"`
	Title       string `gorm:"column:title"`
	Description string `gorm:"column:description"`
	Price       int64  `gorm:"column:price"`
	ImageURL    string `gorm:"column:imageUrl"`
	Category    string `gorm:"column:category"`
	Wholesale   int    `gorm:"column:wholesale"`
	Unit        string `gorm:"column:unit"`
	Stock       int    `gorm:"column:stock"`
	OwnerID     int64  `gorm:"column:owner_id"`
	CreatedAt   int64  `gorm:"column:created_at"`
	UpdatedAt   int64  `gorm:"column:updated_at"`
	DeletedAt   *int64 `gorm:"column:deleted_at"`
	// Transient scan targets populated by qualified SQL queries.
	ShopCount int    `gorm:"-"`
	OwnerName string `gorm:"-"`
}

// TableName mirrors the legacy column layout.
func (ProductModel) TableName() string {
	return "products"
}
