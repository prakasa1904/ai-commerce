package domain

// Wholesale indicates whether a product is sold in bulk lots.
type Product struct {
	ID          int64  `json:"id"`
	Title       string `json:"title"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Price       int64  `json:"price"`
	ImageURL    string `json:"imageUrl"`
	Category    string `json:"category"`
	Wholesale   bool   `json:"wholesale"`
	Unit        string `json:"unit"`
	Stock       int    `json:"stock"`
	OwnerID     int64  `json:"ownerId"`
	OwnerName   string `json:"ownerUsername"`
	ShopCount   int    `json:"shopCount"`
	CreatedAt   int64  `json:"createdAt"`
	UpdatedAt   int64  `json:"updatedAt"`
	DeletedAt   *int64 `json:"deletedAt"`
}

// PublicProduct is the public catalog projection (no ownership).
type PublicProduct struct {
	ID          int64  `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Price       int64  `json:"price"`
	ImageURL    string `json:"imageUrl"`
	Category    string `json:"category"`
	Wholesale   bool   `json:"wholesale"`
}

// ShopLink describes a product-to-shop linkage row.
type ShopLink struct {
	ShopID   int64  `json:"shopId"`
	ShopName string `json:"shopName"`
	OwnerID  int64  `json:"ownerId"`
	Price    *int64 `json:"price"`
	Stock    int    `json:"stock"`
}

// ShopProduct is the product row inside a single shop (price/stock come from
// the shop_products join table).
type ShopProduct struct {
	ProductID   int64  `json:"productId"`
	ProductName string `json:"productName"`
	Price       *int64 `json:"price"`
	Stock       int    `json:"stock"`
}
