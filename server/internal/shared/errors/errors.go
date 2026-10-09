package errors

import "errors"

// Sentinel errors for expected business failures. Handlers distinguish them
// with errors.Is and map them to safe HTTP responses.
var (
	ErrNotFound         = errors.New("not found")
	ErrForbidden        = errors.New("forbidden")
	ErrConflict         = errors.New("conflict")
	ErrBadRequest       = errors.New("bad request")
	ErrUnauthenticated  = errors.New("not authenticated")
	ErrInvalidToken     = errors.New("invalid or expired token")
	ErrValidationFailed = errors.New("validation failed")
)
