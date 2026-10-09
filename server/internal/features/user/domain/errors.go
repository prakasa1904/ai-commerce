package domain

import "errors"

// Sentinel errors define the expected failure modes of the user feature.
var (
	ErrUserNotFound       = errors.New("user not found")
	ErrEmailExists        = errors.New("an account with this email already exists")
	ErrInvalidCredentials = errors.New("incorrect email or password")
)
