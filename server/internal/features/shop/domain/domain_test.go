package domain_test

import (
	"testing"

	"github.com/stretchr/testify/assert"

	shopdomain "github.com/prakasa1904/ai-commerce/internal/features/shop/domain"
)

func TestShopProjections(t *testing.T) {
	s := shopdomain.Shop{ID: 9, OwnerID: 2, Name: "Green Acres", OwnerName: "farmer1"}
	pub := s.ToPublic()
	assert.Equal(t, int64(9), pub.ID)
	assert.Equal(t, int64(2), pub.OwnerID)
	assert.Equal(t, "farmer1", pub.OwnerName)
	assert.Equal(t, "Green Acres", pub.Name)
}

func TestMemberJSONShape(t *testing.T) {
	m := shopdomain.Member{ShopID: 1, UserID: 7, Username: "u", Name: "User",
		Email: "u@x.y", Role: shopdomain.MembershipAdmin}
	assert.Equal(t, int64(7), m.UserID)
	assert.Equal(t, shopdomain.MembershipAdmin, m.Role)
}
