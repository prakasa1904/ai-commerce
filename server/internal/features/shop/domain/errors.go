package domain

import "errors"

// Domain errors used by the shop feature.
var (
	ErrShopNotFound       = errors.New("shop not found")
	ErrMembershipNotFound = errors.New("membership not found")
	ErrProductNotInShop   = errors.New("product not linked to shop")
)
