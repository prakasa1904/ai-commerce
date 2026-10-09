package logger

import (
	"fmt"

	"go.uber.org/zap"
)

// NewLogger builds a Zap logger. Development environments get verbose output,
// production gets a compact JSON stream.
func NewLogger(env string) (*zap.Logger, error) {
	if env == "development" {
		return zap.NewDevelopment()
	}
	return zap.NewProduction()
}

// Must returns a logger or panics. Panicking at startup is acceptable: the
// process cannot continue without an operational logger.
func Must(l *zap.Logger, err error) *zap.Logger {
	if err != nil {
		panic(fmt.Sprintf("initialize logger: %v", err))
	}
	return l
}
