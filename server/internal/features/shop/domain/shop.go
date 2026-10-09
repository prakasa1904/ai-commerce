package domain

// Shop is the core business entity for a seller storefront.
type Shop struct {
	ID          int64
	OwnerID     int64
	Name        string
	Description string
	Website     string
	Phone       string
	Email       string
	Address     string
	Employees   string
	CreatedAt   int64
	UpdatedAt   int64
	DeletedAt   *int64
	OwnerName   string
}

// ShopPublic is the read-only projection shared across features.
type ShopPublic struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Website     string `json:"website"`
	Phone       string `json:"phone"`
	Email       string `json:"email"`
	Address     string `json:"address"`
	Employees   string `json:"employees"`
	OwnerID     int64  `json:"ownerId"`
	OwnerName   string `json:"ownerUsername"`
	CreatedAt   int64  `json:"createdAt"`
	UpdatedAt   int64  `json:"updatedAt"`
	DeletedAt   *int64 `json:"deletedAt"`
}

// ToPublic projects a Shop into its public form.
func (s Shop) ToPublic() ShopPublic {
	return ShopPublic{
		ID:          s.ID,
		Name:        s.Name,
		Description: s.Description,
		Website:     s.Website,
		Phone:       s.Phone,
		Email:       s.Email,
		Address:     s.Address,
		Employees:   s.Employees,
		OwnerID:     s.OwnerID,
		OwnerName:   s.OwnerName,
		CreatedAt:   s.CreatedAt,
		UpdatedAt:   s.UpdatedAt,
		DeletedAt:   s.DeletedAt,
	}
}

// MembershipRole distinguishes permissions inside a shop.
type MembershipRole string

const (
	MembershipAdmin    MembershipRole = "admin"
	MembershipNonAdmin MembershipRole = "non_admin"
)

// Member joins a user to a shop.
type Member struct {
	ShopID    int64          `json:"shopId"`
	UserID    int64          `json:"userId"`
	Username  string         `json:"username"`
	Name      string         `json:"name"`
	Email     string         `json:"email"`
	Role      MembershipRole `json:"role"`
	CreatedAt int64          `json:"createdAt"`
	DeletedAt *int64         `json:"deletedAt"`
}
