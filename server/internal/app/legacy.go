package app

import (
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// LegacyFixes repairs data that older schema versions may have left behind:
// - the misspelled "suplies" product category is renamed to "supplies"
// - plaintext (non-bcrypt) passwords are rehashed with bcrypt
func LegacyFixes(db *gorm.DB, log *zap.Logger) error {
	if err := db.Exec(`UPDATE products SET category = 'supplies' WHERE category = 'suplies'`).Error; err != nil {
		log.Warn("legacy category fix failed", zap.Error(err))
	}

	var pending []struct {
		ID       int64  `gorm:"column:id"`
		Password string `gorm:"column:password"`
	}
	if err := db.Model(&struct{}{}).
		Table("users").
		Where("password NOT LIKE '$2%' AND password != ''").
		Select("id, password").Scan(&pending).Error; err != nil {
		log.Warn("legacy password scan failed", zap.Error(err))
		return nil
	}
	for i := range pending {
		hash, err := PasswordHasher{}.Hash(pending[i].Password)
		if err != nil {
			log.Warn("legacy password hash failed", zap.Int64("user_id", pending[i].ID), zap.Error(err))
			continue
		}
		if err := db.Exec(`UPDATE users SET password = ? WHERE id = ?`, hash, pending[i].ID).Error; err != nil {
			log.Warn("legacy password update failed", zap.Int64("user_id", pending[i].ID), zap.Error(err))
		}
	}
	return nil
}
