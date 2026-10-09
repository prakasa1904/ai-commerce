package config

import "os"

type Config struct {
	AppEnv       string
	Port         string
	DBPath       string
	JWTSecret    string
	JWTExpiresIn string
}

// Load reads configuration from the environment and applies safe defaults.
func Load() Config {
	return Config{
		AppEnv:       getEnv("APP_ENV", "development"),
		Port:         getEnv("PORT", "5001"),
		DBPath:       getEnv("DB_PATH", "farmer_marketplace.db"),
		JWTSecret:    getEnv("JWT_SECRET", "farm-marketplace-dev-secret"),
		JWTExpiresIn: getEnv("JWT_EXPIRES_IN", "7d"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
