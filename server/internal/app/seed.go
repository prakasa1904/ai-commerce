package app

import (
	"time"

	productrepo "github.com/prakasa1904/ai-commerce/internal/features/product/repository"
	shoprepo "github.com/prakasa1904/ai-commerce/internal/features/shop/repository"
	userrepo "github.com/prakasa1904/ai-commerce/internal/features/user/repository"
	"gorm.io/gorm"
)

// DemoProduct is a seedable public catalog row.
type DemoProduct struct {
	Title       string
	Description string
	Price       int64
	ImageURL    string
	Category    string
	Wholesale   bool
}

// SeedData holds the demo catalog mirrored from the legacy seed script.
var SeedData = []DemoProduct{
	{Title: "Organic Tomatoes", Price: 25000, ImageURL: "https://dummyimage.com/400x300/3E6B4F/FBF8F1&text=Tomatoes", Category: "vegetables", Wholesale: true},
	{Title: "Fresh Strawberries", Price: 50000, ImageURL: "https://dummyimage.com/400x300/3E6B4F/FBF8F1&text=Strawberries", Category: "fruits", Wholesale: true},
	{Title: "Premium Rice", Price: 15000, ImageURL: "https://dummyimage.com/400x300/3E6B4F/FBF8F1&text=Rice", Category: "grains"},
	{Title: "Fresh Milk", Price: 18000, ImageURL: "https://dummyimage.com/400x300/3E6B4F/FBF8F1&text=Milk", Category: "dairy"},
	{Title: "Grass-Fed Eggs", Price: 22000, ImageURL: "https://dummyimage.com/400x300/3E6B4F/FBF8F1&text=Eggs", Category: "dairy", Wholesale: true},
	{Title: "Green Spinach", Price: 12000, ImageURL: "https://dummyimage.com/400x300/3E6B4F/FBF8F1&text=Spinach", Category: "vegetables"},
	{Title: "Banana Bunch", Price: 15000, ImageURL: "https://dummyimage.com/400x300/3E6B4F/FBF8F1&text=Bananas", Category: "fruits", Wholesale: true},
	{Title: "Organic Fertilizer", Price: 80000, ImageURL: "https://dummyimage.com/400x300/3E6B4F/FBF8F1&text=Fertilizer", Category: "supplies", Wholesale: true},
}

func timeNowMillis() int64 {
	return time.Now().UnixMilli()
}

// Seed inserts demo users, products, shops and product links when the users
// table is empty.
func Seed(db *gorm.DB) error {
	var users int64
	if err := db.Model(&userrepo.UserModel{}).Count(&users).Error; err != nil {
		return err
	}
	if users > 0 {
		return nil
	}

	ts := timeNowMillis()
	sellerHash, err := PasswordHasher{}.Hash("demo123")
	if err != nil {
		return err
	}
	buyerHash, err := PasswordHasher{}.Hash("demo123")
	if err != nil {
		return err
	}

	seller := insertUser(db, "demoseller", "Demo Seller", "seller@example.com", "seller", sellerHash, ts)
	insertUser(db, "demobuyer", "Demo Buyer", "buyer@example.com", "buyer", buyerHash, ts)

	for _, p := range SeedData {
		insertProduct(db, seller, p, ts)
	}

	shop1 := insertShop(db, seller, "Dawn Orchard", "Hilltop fruit stall, open at dawn.", "https://dawnoorchard.example", "0812-3456-7890", "hello@dawnoorchard.example", "Jl. Puncak No. 12, Desa Suka Maju, 55361", "3", ts)
	shop2 := insertShop(db, seller, "Valley Greens", "River-valley greens and dairy, cut to order.", "https://valleygreens.example", "0812-5555-1212", "orders@valleygreens.example", "Jl. Sungai no. 8, Desa Sejahtera, 55121", "2", ts)

	linkAllProducts(db, shop1, seller, 25, ts)
	linkCategoryProducts(db, shop2, seller, 40, []string{"dairy", "grains"}, ts)

	if buyer := lookupUserID(db, "demobuyer"); buyer > 0 {
		db.Exec(`INSERT INTO shop_members (shop_id, user_id, role, created_at) VALUES (?, ?, 'non_admin', ?)`, shop1, buyer, ts)
	}
	return nil
}

func insertUser(db *gorm.DB, username, name, email, role, hash string, ts int64) int64 {
	var model userrepo.UserModel
	model.Username = username
	model.Name = name
	model.Email = email
	model.Password = hash
	model.Role = role
	model.CreatedAt = ts
	model.UpdatedAt = ts
	if err := db.Create(&model).Error; err != nil {
		return 0
	}
	return model.ID
}

func insertProduct(db *gorm.DB, ownerID int64, p DemoProduct, ts int64) int64 {
	var model productrepo.ProductModel
	model.Title = p.Title
	model.Description = p.Description
	model.Price = p.Price
	model.ImageURL = p.ImageURL
	model.Category = p.Category
	model.Wholesale = int(boolInt(p.Wholesale))
	model.Unit = "kg"
	model.Stock = 0
	model.OwnerID = ownerID
	model.CreatedAt = ts
	model.UpdatedAt = ts
	if err := db.Create(&model).Error; err != nil {
		return 0
	}
	return model.ID
}

func insertShop(db *gorm.DB, ownerID int64, name, description, website, phone, email, address, employees string, ts int64) int64 {
	var model shoprepo.ShopModel
	model.OwnerID = ownerID
	model.Name = name
	model.Description = description
	model.Website = website
	model.Phone = phone
	model.Email = email
	model.Address = address
	model.Employees = employees
	model.CreatedAt = ts
	model.UpdatedAt = ts
	if err := db.Create(&model).Error; err != nil {
		return 0
	}
	return model.ID
}

func linkAllProducts(db *gorm.DB, shopID, ownerID int64, stock int, ts int64) {
	db.Exec(`INSERT INTO shop_products (shop_id, product_id, price, stock, created_at)
	         SELECT ?, id, NULL, ?, ? FROM products WHERE owner_id = ?`, shopID, stock, ts, ownerID)
}

func linkCategoryProducts(db *gorm.DB, shopID, ownerID int64, stock int, categories []string, ts int64) {
	q := ""
	args := []any{shopID, stock, ts, ownerID}
	for _, c := range categories {
		if q != "" {
			q += " OR category = ?"
		} else {
			q = "category = ?"
		}
		args = append(args, c)
	}
	stmt := `INSERT INTO shop_products (shop_id, product_id, price, stock, created_at)
	         SELECT ?, id, NULL, ?, ? FROM products WHERE owner_id = ? AND (` + q + `)`
	db.Exec(stmt, args...)
}

func lookupUserID(db *gorm.DB, username string) int64 {
	var model userrepo.UserModel
	if err := db.Where("username = ?", username).Select("id").Take(&model).Error; err != nil {
		return 0
	}
	return model.ID
}

func boolInt(b bool) int {
	if b {
		return 1
	}
	return 0
}
