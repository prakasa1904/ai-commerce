package response

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	sharederrors "github.com/prakasa1904/ai-commerce/internal/shared/errors"
)

// ErrorResponse is the single error envelope returned to clients.
type ErrorResponse struct {
	Message string `json:"error"`
}

// OK writes a success payload with the given status.
func OK(c *fiber.Ctx, status int, payload any) error {
	return c.Status(status).JSON(payload)
}

// Error maps an application error to a safe HTTP response. It never exposes
// internal package names, stack traces, or raw database errors.
func Error(c *fiber.Ctx, err error) error {
	var status int
	switch {
	case errors.Is(err, sharederrors.ErrNotFound):
		status = fiber.StatusNotFound
	case errors.Is(err, sharederrors.ErrForbidden):
		status = fiber.StatusForbidden
	case errors.Is(err, sharederrors.ErrConflict):
		status = fiber.StatusConflict
	case errors.Is(err, sharederrors.ErrUnauthenticated), errors.Is(err, sharederrors.ErrInvalidToken):
		status = fiber.StatusUnauthorized
	case errors.Is(err, sharederrors.ErrBadRequest):
		status = fiber.StatusBadRequest
	case errors.Is(err, sharederrors.ErrValidationFailed):
		status = fiber.StatusBadRequest
	default:
		status = fiber.StatusInternalServerError
	}

	return c.Status(status).JSON(ErrorResponse{Message: err.Error()})
}
