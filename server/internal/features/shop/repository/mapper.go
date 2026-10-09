package repository

import (
	shopdomain "github.com/prakasa1904/ai-commerce/internal/features/shop/domain"
)

func toDomainShop(m ShopModel) shopdomain.Shop {
	return shopdomain.Shop{
		ID:          m.ID,
		OwnerID:     m.OwnerID,
		Name:        m.Name,
		Description: m.Description,
		Website:     m.Website,
		Phone:       m.Phone,
		Email:       m.Email,
		Address:     m.Address,
		Employees:   m.Employees,
		CreatedAt:   m.CreatedAt,
		UpdatedAt:   m.UpdatedAt,
		DeletedAt:   m.DeletedAt,
		OwnerName:   m.OwnerName,
	}
}

func toShopModel(s shopdomain.Shop) ShopModel {
	return ShopModel{
		ID:          s.ID,
		OwnerID:     s.OwnerID,
		Name:        s.Name,
		Description: s.Description,
		Website:     s.Website,
		Phone:       s.Phone,
		Email:       s.Email,
		Address:     s.Address,
		Employees:   s.Employees,
		CreatedAt:   s.CreatedAt,
		UpdatedAt:   s.UpdatedAt,
		DeletedAt:   s.DeletedAt,
	}
}

func toDomainMember(m ShopMemberModel) shopdomain.Member {
	return shopdomain.Member{
		ShopID:    m.ShopID,
		UserID:    m.UserID,
		Username:  m.Username,
		Name:      m.Name,
		Email:     m.Email,
		Role:      shopdomain.MembershipRole(m.Role),
		CreatedAt: m.CreatedAt,
		DeletedAt: m.DeletedAt,
	}
}
