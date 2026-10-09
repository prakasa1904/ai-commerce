package main

import (
	"github.com/prakasa1904/ai-commerce/internal/app"
	"github.com/prakasa1904/ai-commerce/internal/config"
	"github.com/prakasa1904/ai-commerce/internal/platform/database"
	"github.com/prakasa1904/ai-commerce/internal/platform/logger"
	"go.uber.org/zap"
)

func main() {
	cfg := config.Load()
	log, err := logger.NewLogger(cfg.AppEnv)
	if err != nil {
		panic(err)
	}
	defer log.Sync()

	db, err := database.NewSQLiteDB(cfg.DBPath, log)
	if err != nil {
		log.Fatal("database init failed", zap.Error(err))
	}

	if err := app.Migrate(db, log); err != nil {
		log.Fatal("migration failed", zap.Error(err))
	}

	if err := app.Seed(db); err != nil {
		log.Fatal("seed failed", zap.Error(err))
	}

	log.Info("Seeded demo data.")
}
