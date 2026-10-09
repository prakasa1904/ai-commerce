package domain_test

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/prakasa1904/ai-commerce/internal/features/user/domain"
)

func TestUserSanitize(t *testing.T) {
	u := domain.User{ID: 1, Username: "alice", Password: "secret"}
	sanitized := u.Sanitize()
	assert.Empty(t, sanitized.Password)
	assert.Equal(t, u.Username, sanitized.Username)
}

func TestUserToPublic(t *testing.T) {
	u := domain.User{ID: 3, Username: "bob", Name: "Bob", Email: "b@x.y",
		Role: domain.RoleSeller, IsAdmin: true, DeletedAt: nil}
	pub := u.ToPublic()
	assert.Equal(t, int64(3), pub.ID)
	assert.Equal(t, domain.RoleSeller, pub.Role)
	assert.True(t, pub.IsAdmin)
}

func TestTimeMillisIsRecent(t *testing.T) {
	assert.Greater(t, domain.TimeMillis(), int64(0))
}
