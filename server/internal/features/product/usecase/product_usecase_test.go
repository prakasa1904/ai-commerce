package usecase_test

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/prakasa1904/ai-commerce/internal/features/product/domain"
	"github.com/prakasa1904/ai-commerce/internal/features/product/usecase"
	sharederrors "github.com/prakasa1904/ai-commerce/internal/shared/errors"
)

type mockProductRepo struct {
	list       func(ctx context.Context, ownerID int64, includeDeleted bool, query string) ([]domain.Product, error)
	listPublic func(ctx context.Context) ([]domain.PublicProduct, error)
	get        func(ctx context.Context, id int64) (*domain.Product, error)
	create     func(ctx context.Context, ownerID int64, p domain.Product) (*domain.Product, error)
	update     func(ctx context.Context, id int64, fields map[string]any, updatedAt int64) (*domain.Product, error)
	softDelete func(ctx context.Context, id, deletedAt int64) error
	restore    func(ctx context.Context, id, updatedAt int64) error

	created *domain.Product
	updated *domain.Product
}

func (m *mockProductRepo) List(ctx context.Context, ownerID int64, includeDeleted bool, query string) ([]domain.Product, error) {
	return m.list(ctx, ownerID, includeDeleted, query)
}
func (m *mockProductRepo) ListPublic(ctx context.Context) ([]domain.PublicProduct, error) {
	return m.listPublic(ctx)
}
func (m *mockProductRepo) Get(ctx context.Context, id int64) (*domain.Product, error) {
	return m.get(ctx, id)
}
func (m *mockProductRepo) Create(ctx context.Context, ownerID int64, p domain.Product) (*domain.Product, error) {
	m.created = &p
	m.created.OwnerID = ownerID
	return m.create(ctx, ownerID, p)
}
func (m *mockProductRepo) Update(ctx context.Context, id int64, fields map[string]any, updatedAt int64) (*domain.Product, error) {
	m.updated = &domain.Product{ID: id, Title: fields["title"].(string)}
	return m.update(ctx, id, fields, updatedAt)
}
func (m *mockProductRepo) SoftDelete(ctx context.Context, id, deletedAt int64) error {
	return m.softDelete(ctx, id, deletedAt)
}
func (m *mockProductRepo) Restore(ctx context.Context, id, updatedAt int64) error {
	return m.restore(ctx, id, updatedAt)
}

type mockShopStore struct {
	ownerIDOfShop  func(ctx context.Context, shopID int64) (int64, error)
	shopsByProduct func(ctx context.Context, productID int64) ([]domain.ShopLink, error)
	linkProduct    func(ctx context.Context, productID, shopID int64, price *int64, stock int) error
	unlinkProduct  func(ctx context.Context, productID, shopID int64) error

	linkArgs struct {
		productID, shopID int64
		price             *int64
		stock             int
	}
}

func (m *mockShopStore) OwnerIDOfShop(ctx context.Context, shopID int64) (int64, error) {
	return m.ownerIDOfShop(ctx, shopID)
}
func (m *mockShopStore) ShopsByProduct(ctx context.Context, productID int64) ([]domain.ShopLink, error) {
	return m.shopsByProduct(ctx, productID)
}
func (m *mockShopStore) LinkProduct(ctx context.Context, productID, shopID int64, price *int64, stock int) error {
	m.linkArgs = struct {
		productID, shopID int64
		price             *int64
		stock             int
	}{productID, shopID, price, stock}
	return m.linkProduct(ctx, productID, shopID, price, stock)
}
func (m *mockShopStore) UnlinkProduct(ctx context.Context, productID, shopID int64) error {
	return m.unlinkProduct(ctx, productID, shopID)
}

func newTestProductUsecase(repo usecase.ProductRepository, store usecase.ShopProductStore) *usecase.ProductUsecase {
	return usecase.NewProductUsecase(repo, store)
}

func TestListPublic_Delegates(t *testing.T) {
	prods := []domain.PublicProduct{{ID: 1, Title: "Apple"}}
	repo := &mockProductRepo{listPublic: func(ctx context.Context) ([]domain.PublicProduct, error) { return prods, nil }}
	uc := newTestProductUsecase(repo, &mockShopStore{})
	out, err := uc.ListPublic(context.Background())
	require.NoError(t, err)
	assert.Equal(t, "Apple", out[0].Title)
}

func TestList_NonAdminScopedToOwner(t *testing.T) {
	var gotOwner int64
	var gotDeleted bool
	repo := &mockProductRepo{
		list: func(ctx context.Context, ownerID int64, includeDeleted bool, query string) ([]domain.Product, error) {
			gotOwner, gotDeleted = ownerID, includeDeleted
			return []domain.Product{{ID: 1}}, nil
		},
	}
	uc := newTestProductUsecase(repo, &mockShopStore{})
	out, err := uc.List(context.Background(), 11, false, usecase.ListOptions{OwnerID: 99, IncludeDeleted: true})
	require.NoError(t, err)
	assert.Len(t, out, 1)
	assert.Equal(t, int64(11), gotOwner)
	assert.False(t, gotDeleted, "non-admin never sees deleted products")
}

func TestList_AdminRespectsOptions(t *testing.T) {
	var gotOwner int64
	repo := &mockProductRepo{
		list: func(ctx context.Context, ownerID int64, includeDeleted bool, query string) ([]domain.Product, error) {
			gotOwner = ownerID
			return []domain.Product{}, nil
		},
	}
	uc := newTestProductUsecase(repo, &mockShopStore{})
	_, err := uc.List(context.Background(), 0, true, usecase.ListOptions{OwnerID: 99, IncludeDeleted: true})
	require.NoError(t, err)
	assert.Equal(t, int64(99), gotOwner)
}

func TestCreate_RejectsMissingOwner(t *testing.T) {
	uc := newTestProductUsecase(&mockProductRepo{}, &mockShopStore{})
	_, err := uc.Create(context.Background(), 0, usecase.CreateInput{Title: "X"})
	assert.ErrorIs(t, err, sharederrors.ErrBadRequest)
}

func TestCreate_SetsOwnerAndDefaults(t *testing.T) {
	repo := &mockProductRepo{
		create: func(ctx context.Context, ownerID int64, p domain.Product) (*domain.Product, error) { return &p, nil },
	}
	uc := newTestProductUsecase(repo, &mockShopStore{})
	out, err := uc.Create(context.Background(), 4, usecase.CreateInput{
		Title: "Corn", Description: "Sweet", Price: 10, ImageURL: "img.png",
		Category: "supplies", Unit: "each", Stock: 5, Wholesale: false,
	})
	require.NoError(t, err)
	assert.Equal(t, int64(4), out.OwnerID)
	assert.Equal(t, "Corn", out.Title)
	assert.Equal(t, "Corn", out.Name, "name defaults to title")
	assert.Equal(t, "img.png", out.ImageURL)
	assert.Equal(t, int64(10), out.Price)
	assert.Equal(t, "each", out.Unit)
	assert.False(t, out.Wholesale)
	assert.True(t, out.CreatedAt > 0)
}

func TestUpdate_FieldsBuiltAndWholesaleFlag(t *testing.T) {
	var gotFields map[string]any
	repo := &mockProductRepo{
		get: func(ctx context.Context, id int64) (*domain.Product, error) {
			return &domain.Product{ID: id, OwnerID: 2}, nil
		},
		update: func(ctx context.Context, id int64, fields map[string]any, updatedAt int64) (*domain.Product, error) {
			gotFields = fields
			return &domain.Product{ID: id, Title: fields["title"].(string)}, nil
		},
	}
	uc := newTestProductUsecase(repo, &mockShopStore{})
	title := "New Title"
	price := int64(25)
	stock := 7
	wholesale := true
	_, err := uc.Update(context.Background(), 2, false, 3, usecase.UpdateInput{
		Title: &title, Price: &price, Stock: &stock, Wholesale: &wholesale,
	})
	require.NoError(t, err)
	assert.Equal(t, "New Title", gotFields["title"])
	assert.Equal(t, int64(25), gotFields["price"])
	assert.Equal(t, 7, gotFields["stock"])
	assert.Equal(t, 1, gotFields["wholesale"], "wholesale true maps to 1")
	assert.NotEmpty(t, gotFields)
}

func TestUpdate_ForbiddenForOtherOwner(t *testing.T) {
	repo := &mockProductRepo{
		get: func(ctx context.Context, id int64) (*domain.Product, error) {
			return &domain.Product{ID: id, OwnerID: 2}, nil
		},
	}
	uc := newTestProductUsecase(repo, &mockShopStore{})
	_, err := uc.Update(context.Background(), 99, false, 3, usecase.UpdateInput{})
	assert.ErrorIs(t, err, sharederrors.ErrForbidden)
}

func TestDelete_Allowed(t *testing.T) {
	var deleted int64
	repo := &mockProductRepo{
		get: func(ctx context.Context, id int64) (*domain.Product, error) {
			return &domain.Product{ID: id, OwnerID: 2}, nil
		},
		softDelete: func(ctx context.Context, id, deletedAt int64) error { deleted = id; return nil },
	}
	uc := newTestProductUsecase(repo, &mockShopStore{})
	require.NoError(t, uc.Delete(context.Background(), 2, false, 3))
	assert.Equal(t, int64(3), deleted)
}

func TestDelete_Forbidden(t *testing.T) {
	repo := &mockProductRepo{
		get: func(ctx context.Context, id int64) (*domain.Product, error) {
			return &domain.Product{ID: id, OwnerID: 2}, nil
		},
	}
	uc := newTestProductUsecase(repo, &mockShopStore{})
	err := uc.Delete(context.Background(), 99, false, 3)
	assert.ErrorIs(t, err, sharederrors.ErrForbidden)
}

func TestRestore_Delegates(t *testing.T) {
	var restored int64
	repo := &mockProductRepo{restore: func(ctx context.Context, id, updatedAt int64) error { restored = id; return nil }}
	uc := newTestProductUsecase(repo, &mockShopStore{})
	require.NoError(t, uc.Restore(context.Background(), 5))
	assert.Equal(t, int64(5), restored)
}

func TestLinkProduct_ConflictMismatchOwner(t *testing.T) {
	repo := &mockProductRepo{
		get: func(ctx context.Context, id int64) (*domain.Product, error) {
			return &domain.Product{ID: id, OwnerID: 1}, nil
		},
	}
	store := &mockShopStore{ownerIDOfShop: func(ctx context.Context, shopID int64) (int64, error) { return 9, nil }}
	uc := newTestProductUsecase(repo, store)
	err := uc.LinkProduct(context.Background(), 1, true, 3, 7, nil, 0)
	assert.ErrorIs(t, err, sharederrors.ErrConflict)
}

func TestLinkProduct_ForbiddenForNonOwnerRequester(t *testing.T) {
	repo := &mockProductRepo{
		get: func(ctx context.Context, id int64) (*domain.Product, error) {
			return &domain.Product{ID: id, OwnerID: 1}, nil
		},
	}
	store := &mockShopStore{ownerIDOfShop: func(ctx context.Context, shopID int64) (int64, error) { return 1, nil }}
	uc := newTestProductUsecase(repo, store)
	err := uc.LinkProduct(context.Background(), 2, false, 3, 7, nil, 0)
	assert.ErrorIs(t, err, sharederrors.ErrForbidden)
}

func TestLinkProduct_Success(t *testing.T) {
	price := int64(30)
	repo := &mockProductRepo{
		get: func(ctx context.Context, id int64) (*domain.Product, error) {
			return &domain.Product{ID: id, OwnerID: 1}, nil
		},
	}
	store := &mockShopStore{
		ownerIDOfShop: func(ctx context.Context, shopID int64) (int64, error) { return 1, nil },
		linkProduct:   func(ctx context.Context, productID, shopID int64, price *int64, stock int) error { return nil },
	}
	uc := newTestProductUsecase(repo, store)
	require.NoError(t, uc.LinkProduct(context.Background(), 1, false, 3, 7, &price, 12))
	assert.Equal(t, struct {
		productID, shopID int64
		price             *int64
		stock             int
	}{3, 7, &price, 12}, store.linkArgs)
}

func TestUnlinkProduct_ForbiddenForOtherOwner(t *testing.T) {
	store := &mockShopStore{ownerIDOfShop: func(ctx context.Context, shopID int64) (int64, error) { return 1, nil }}
	uc := newTestProductUsecase(&mockProductRepo{}, store)
	err := uc.UnlinkProduct(context.Background(), 2, false, 3, 7)
	assert.ErrorIs(t, err, sharederrors.ErrForbidden)
}

func TestUnlinkProduct_Success(t *testing.T) {
	var gotProduct, gotShop int64
	store := &mockShopStore{
		ownerIDOfShop: func(ctx context.Context, shopID int64) (int64, error) { return 1, nil },
		unlinkProduct: func(ctx context.Context, productID, shopID int64) error {
			gotProduct, gotShop = productID, shopID
			return nil
		},
	}
	uc := newTestProductUsecase(&mockProductRepo{}, store)
	require.NoError(t, uc.UnlinkProduct(context.Background(), 1, false, 3, 7))
	assert.Equal(t, int64(3), gotProduct)
	assert.Equal(t, int64(7), gotShop)
}

func TestListShops_Delegates(t *testing.T) {
	links := []domain.ShopLink{{ShopID: 4, ShopName: "Farm"}}
	store := &mockShopStore{shopsByProduct: func(ctx context.Context, productID int64) ([]domain.ShopLink, error) { return links, nil }}
	uc := newTestProductUsecase(&mockProductRepo{}, store)
	out, err := uc.ListShops(context.Background(), 3)
	require.NoError(t, err)
	assert.Equal(t, "Farm", out[0].ShopName)
}

func TestUpdate_RepoGetErrorPropagates(t *testing.T) {
	boom := errors.New("db down")
	repo := &mockProductRepo{get: func(ctx context.Context, id int64) (*domain.Product, error) { return nil, boom }}
	uc := newTestProductUsecase(repo, &mockShopStore{})
	_, err := uc.Update(context.Background(), 1, true, 3, usecase.UpdateInput{})
	assert.ErrorIs(t, err, boom)
}
