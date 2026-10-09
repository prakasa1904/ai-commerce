// Package jwt holds the JSON Web Token claims and signing helpers shared by
// the auth delivery layer and the user feature.
package jwt

import (
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Claims is the signed token payload. Role and IsAdmin mirror the user
// feature vocabulary ("seller"/"buyer").
type Claims struct {
	ID       int64  `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	IsAdmin  bool   `json:"isAdmin"`
	jwt.RegisteredClaims
}

// Signer issues and verifies HS256 tokens.
type Signer struct {
	secret  []byte
	expires time.Duration
}

// NewSigner builds a Signer from the configured secret and expiry duration.
func NewSigner(secret string, expires time.Duration) *Signer {
	return &Signer{secret: []byte(secret), expires: expires}
}

// Sign creates a token whose registered claims include the standard expiry.
func (s *Signer) Sign(claims *Claims) (string, error) {
	now := time.Now()
	claims.IssuedAt = jwt.NewNumericDate(now)
	claims.ExpiresAt = jwt.NewNumericDate(now.Add(s.expires))

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.secret)
}

// Parse verifies a token and its claims against the signing secret.
func (s *Signer) Parse(raw string) (*Claims, error) {
	parsed := &Claims{}
	_, err := jwt.ParseWithClaims(strings.TrimSpace(raw), parsed, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return s.secret, nil
	})
	if err != nil {
		return nil, jwt.ErrTokenInvalidClaims
	}
	return parsed, nil
}
