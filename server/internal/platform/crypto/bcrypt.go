package crypto

import "golang.org/x/crypto/bcrypt"

const bcryptCost = 10

// HashPassword hashes a plaintext password for storage. The cost factor is
// fixed so verification is fast and predictable.
func HashPassword(plaintext string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(plaintext), bcryptCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

// ComparePassword reports whether plaintext matches a bcrypt hash. A
// non-matching hash never fails; a malformed hash returns false without
// panicking.
func ComparePassword(plaintext, hash string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(plaintext)) == nil
}
