package repository

import (
	"github.com/prakasa1904/ai-commerce/internal/features/product/domain"
)

func toDomainProduct(m ProductModel) domain.Product {
	return domain.Product{
		ID:          m.ID,
		Title:       m.Title,
		Name:        m.Title,
		Description: m.Description,
		Price:       m.Price,
		ImageURL:    m.ImageURL,
		Category:    m.Category,
		Wholesale:   m.Wholesale == 1,
		Unit:        m.Unit,
		Stock:       m.Stock,
		OwnerID:     m.OwnerID,
		ShopCount:   m.ShopCount,
		OwnerName:   m.OwnerName,
		CreatedAt:   m.CreatedAt,
		UpdatedAt:   m.UpdatedAt,
		DeletedAt:   m.DeletedAt,
	}
}

func toProductModel(p domain.Product) ProductModel {
	return ProductModel{
		ID:          p.ID,
		Title:       p.Title,
		Description: p.Description,
		Price:       p.Price,
		ImageURL:    p.ImageURL,
		Category:    p.Category,
		Wholesale:   wholesaleFlag(p.Wholesale),
		Unit:        p.Unit,
		Stock:       p.Stock,
		OwnerID:     p.OwnerID,
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
		DeletedAt:   p.DeletedAt,
	}
}

func wholesaleFlag(b bool) int {
	if b {
		return 1
	}
	return 0
}

func toPublicProduct(p domain.Product) domain.PublicProduct {
	return domain.PublicProduct{
		ID:          p.ID,
		Title:       p.Title,
		Description: p.Description,
		Price:       p.Price,
		ImageURL:    p.ImageURL,
		Category:    p.Category,
		Wholesale:   p.Wholesale,
	}
}
