package database

import (
	"fmt"

	"go.uber.org/zap"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// NewSQLiteDB opens the GORM connection to a local SQLite database file and
// runs schema auto-migration. SQLite is used so the marketplace can share one
// data file with the frontend during development.
func NewSQLiteDB(path string, logger *zap.Logger) (*gorm.DB, error) {
	dsn := fmt.Sprintf("file:%s?_journal_mode=WAL&_busy_timeout=5000", path)
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		logger.Error("failed to connect to database", zap.Error(err))
		return nil, fmt.Errorf("connect database: %w", err)
	}
	return db, nil
}

// AutoMigrate runs GORM schema auto-migration for every model type provided.
func AutoMigrate(db *gorm.DB, models ...any) error {
	return db.AutoMigrate(models...)
}
