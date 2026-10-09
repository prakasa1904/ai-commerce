package main

import (
	"github.com/prakasa1904/ai-commerce/internal/app"
	"github.com/prakasa1904/ai-commerce/internal/config"
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

	deps, err := app.Bootstrap(cfg)
	if err != nil {
		log.Fatal("bootstrap failed", zap.Error(err))
	}

	log.Info("Server running", zap.String("addr", ":"+cfg.Port))
	if err := deps.App.Listen(":" + cfg.Port); err != nil {
		log.Fatal("server failed", zap.Error(err))
	}
}
