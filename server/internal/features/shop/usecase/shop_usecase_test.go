package usecase_test

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"

	productdomain "github.com/prakasa1904/ai-commerce/internal/features/product/domain"
	shopdomain "github.com/prakasa1904/ai-commerce/internal/features/shop/domain"
	"github.com/prakasa1904/ai-commerce/internal/features/shop/usecase"
	sharederrors "github.com/prakasa1904/ai-commerce/internal/shared/errors"
)

type mockShopRepo struct {
	list                        func(ctx context.Context, includeDeleted bool, ownerID int64, query string) ([]shopdomain.Shop, error)
	get                         func(ctx context.Context, id int64) (*shopdomain.Shop, error)
	create                      func(ctx context.Context, ownerID int64, s shopdomain.Shop) (*shopdomain.Shop, error)
	update                      func(ctx context.Context, id int64, fields map[string]any, updatedAt int64) (*shopdomain.Shop, error)
	softDelete                  func(ctx context.Context, id, deletedAt int64) error
	restore                     func(ctx context.Context, id, updatedAt int64) error
	getMembershipRole           func(ctx context.Context, shopID, userID int64) (shopdomain.MembershipRole, bool, error)
	listMembers                 func(ctx context.Context, shopID int64) ([]shopdomain.Member, error)
	addMember                   func(ctx context.Context, shopID, userID int64, role shopdomain.MembershipRole) ([]shopdomain.Member, error)
	updateMember                func(ctx context.Context, shopID, userID int64, role shopdomain.MembershipRole) ([]shopdomain.Member, error)
	removeMember                func(ctx context.Context, shopID, userID int64, requesterRole shopdomain.MembershipRole) error
	listProducts                func(ctx context.Context, shopID int64) ([]productdomain.ShopProduct, error)
	softDeleteShopsByOwner      func(ctx context.Context, ownerID, deletedAt int64) error
	softDeleteMembershipsByUser func(ctx context.Context, userID, deletedAt int64) error

	createdShop   *shopdomain.Shop
	deletedIDs    []int64
	memberAddArgs struct {
		shopID, userID int64
		role           shopdomain.MembershipRole
	}
}

func (m *mockShopRepo) List(ctx context.Context, includeDeleted bool, ownerID int64, query string) ([]shopdomain.Shop, error) {
	return m.list(ctx, includeDeleted, ownerID, query)
}
func (m *mockShopRepo) Get(ctx context.Context, id int64) (*shopdomain.Shop, error) {
	return m.get(ctx, id)
}
func (m *mockShopRepo) Create(ctx context.Context, ownerID int64, s shopdomain.Shop) (*shopdomain.Shop, error) {
	m.createdShop = &s
	m.createdShop.OwnerID = ownerID
	return m.create(ctx, ownerID, s)
}
func (m *mockShopRepo) Update(ctx context.Context, id int64, fields map[string]any, updatedAt int64) (*shopdomain.Shop, error) {
	return m.update(ctx, id, fields, updatedAt)
}
func (m *mockShopRepo) SoftDelete(ctx context.Context, id, deletedAt int64) error {
	m.deletedIDs = append(m.deletedIDs, id)
	return m.softDelete(ctx, id, deletedAt)
}
func (m *mockShopRepo) Restore(ctx context.Context, id, updatedAt int64) error {
	return m.restore(ctx, id, updatedAt)
}
func (m *mockShopRepo) GetMembershipRole(ctx context.Context, shopID, userID int64) (shopdomain.MembershipRole, bool, error) {
	return m.getMembershipRole(ctx, shopID, userID)
}
func (m *mockShopRepo) ListMembers(ctx context.Context, shopID int64) ([]shopdomain.Member, error) {
	return m.listMembers(ctx, shopID)
}
func (m *mockShopRepo) AddMember(ctx context.Context, shopID, userID int64, role shopdomain.MembershipRole) ([]shopdomain.Member, error) {
	m.memberAddArgs = struct {
		shopID, userID int64
		role           shopdomain.MembershipRole
	}{shopID, userID, role}
	return m.addMember(ctx, shopID, userID, role)
}
func (m *mockShopRepo) UpdateMember(ctx context.Context, shopID, userID int64, role shopdomain.MembershipRole) ([]shopdomain.Member, error) {
	return m.updateMember(ctx, shopID, userID, role)
}
func (m *mockShopRepo) RemoveMember(ctx context.Context, shopID, userID int64, requesterRole shopdomain.MembershipRole) error {
	return m.removeMember(ctx, shopID, userID, requesterRole)
}
func (m *mockShopRepo) ListProducts(ctx context.Context, shopID int64) ([]productdomain.ShopProduct, error) {
	return m.listProducts(ctx, shopID)
}
func (m *mockShopRepo) SoftDeleteShopsByOwner(ctx context.Context, ownerID, deletedAt int64) error {
	return m.softDeleteShopsByOwner(ctx, ownerID, deletedAt)
}
func (m *mockShopRepo) SoftDeleteMembershipsByUser(ctx context.Context, userID, deletedAt int64) error {
	return m.softDeleteMembershipsByUser(ctx, userID, deletedAt)
}

func newTestShopUsecase(repo usecase.ShopRepository) *usecase.ShopUsecase {
	return usecase.NewShopUsecase(repo, zap.NewNop())
}

func TestList_AdminSeesAll(t *testing.T) {
	shops := []shopdomain.Shop{{ID: 1, Name: "A"}, {ID: 2, Name: "B"}}
	var gotDeleted bool
	var gotOwner int64
	repo := &mockShopRepo{
		list: func(ctx context.Context, includeDeleted bool, ownerID int64, query string) ([]shopdomain.Shop, error) {
			gotDeleted, gotOwner = includeDeleted, ownerID
			return shops, nil
		},
	}
	uc := newTestShopUsecase(repo)

	out, err := uc.List(context.Background(), 0, true, usecase.ListOptions{IncludeDeleted: true})
	require.NoError(t, err)
	assert.Len(t, out, 2)
	assert.True(t, gotDeleted)
	assert.Equal(t, int64(0), gotOwner)
}

func TestList_NonAdminSeesOwnOnly(t *testing.T) {
	repo := &mockShopRepo{
		list: func(ctx context.Context, includeDeleted bool, ownerID int64, query string) ([]shopdomain.Shop, error) {
			assert.False(t, includeDeleted, "non-admin never sees deleted")
			assert.Equal(t, int64(7), ownerID)
			return []shopdomain.Shop{{ID: 1, Name: "Mine"}}, nil
		},
	}
	uc := newTestShopUsecase(repo)
	out, err := uc.List(context.Background(), 7, false, usecase.ListOptions{IncludeDeleted: true})
	require.NoError(t, err)
	assert.Len(t, out, 1)
}

func TestCreate_RejectsMissingOwner(t *testing.T) {
	uc := newTestShopUsecase(&mockShopRepo{})
	_, err := uc.Create(context.Background(), 0, usecase.CreateInput{Name: "Shop"})
	assert.ErrorIs(t, err, sharederrors.ErrBadRequest)
}

func TestCreate_SetsOwnerAndTimestamps(t *testing.T) {
	repo := &mockShopRepo{
		create: func(ctx context.Context, ownerID int64, s shopdomain.Shop) (*shopdomain.Shop, error) { return &s, nil },
	}
	uc := newTestShopUsecase(repo)
	out, err := uc.Create(context.Background(), 9, usecase.CreateInput{Name: "Farm Stand", Employees: "3"})
	require.NoError(t, err)
	assert.Equal(t, int64(9), out.OwnerID)
	assert.Equal(t, "Farm Stand", out.Name)
	assert.Equal(t, "3", out.Employees)
	assert.True(t, out.CreatedAt > 0)
	assert.True(t, out.UpdatedAt > 0)
}

func TestGet_AdminSeesAnyShop(t *testing.T) {
	repo := &mockShopRepo{
		get: func(ctx context.Context, id int64) (*shopdomain.Shop, error) {
			return &shopdomain.Shop{ID: id, Name: "Shop"}, nil
		},
	}
	uc := newTestShopUsecase(repo)
	out, err := uc.Get(context.Background(), 1, true, 99)
	require.NoError(t, err)
	assert.Equal(t, int64(99), out.ID)
}

func TestGet_OwnerSeesOwn(t *testing.T) {
	repo := &mockShopRepo{
		get: func(ctx context.Context, id int64) (*shopdomain.Shop, error) {
			return &shopdomain.Shop{ID: id, OwnerID: 3}, nil
		},
	}
	uc := newTestShopUsecase(repo)
	_, err := uc.Get(context.Background(), 3, false, 10)
	assert.NoError(t, err)
}

func TestGet_MemberSeesShop(t *testing.T) {
	repo := &mockShopRepo{
		get: func(ctx context.Context, id int64) (*shopdomain.Shop, error) {
			return &shopdomain.Shop{ID: id, OwnerID: 1}, nil
		},
		getMembershipRole: func(ctx context.Context, shopID, userID int64) (shopdomain.MembershipRole, bool, error) {
			return shopdomain.MembershipNonAdmin, true, nil
		},
	}
	uc := newTestShopUsecase(repo)
	_, err := uc.Get(context.Background(), 42, false, 10)
	assert.NoError(t, err)
}

func TestGet_NonMemberGetsNotFound(t *testing.T) {
	repo := &mockShopRepo{
		get: func(ctx context.Context, id int64) (*shopdomain.Shop, error) {
			return &shopdomain.Shop{ID: id, OwnerID: 1}, nil
		},
		getMembershipRole: func(ctx context.Context, shopID, userID int64) (shopdomain.MembershipRole, bool, error) {
			return "", false, nil
		},
	}
	uc := newTestShopUsecase(repo)
	_, err := uc.Get(context.Background(), 42, false, 10)
	assert.ErrorIs(t, err, shopdomain.ErrShopNotFound)
}

func TestUpdate_OwnerMayUpdate(t *testing.T) {
	repo := &mockShopRepo{
		get: func(ctx context.Context, id int64) (*shopdomain.Shop, error) {
			return &shopdomain.Shop{ID: id, OwnerID: 5}, nil
		},
		update: func(ctx context.Context, id int64, fields map[string]any, updatedAt int64) (*shopdomain.Shop, error) {
			return &shopdomain.Shop{ID: id, Name: fields["name"].(string)}, nil
		},
	}
	uc := newTestShopUsecase(repo)
	name := "New Name"
	out, err := uc.Update(context.Background(), 5, false, 10, usecase.UpdateInput{Name: &name})
	require.NoError(t, err)
	assert.Equal(t, "New Name", out.Name)
}

func TestUpdate_NonMemberForbidden(t *testing.T) {
	repo := &mockShopRepo{
		get: func(ctx context.Context, id int64) (*shopdomain.Shop, error) {
			return &shopdomain.Shop{ID: id, OwnerID: 1}, nil
		},
		getMembershipRole: func(ctx context.Context, shopID, userID int64) (shopdomain.MembershipRole, bool, error) {
			return shopdomain.MembershipNonAdmin, true, nil
		},
	}
	uc := newTestShopUsecase(repo)
	_, err := uc.Update(context.Background(), 42, false, 10, usecase.UpdateInput{Name: nil})
	assert.ErrorIs(t, err, sharederrors.ErrForbidden)
}

func TestDelete_CanManage(t *testing.T) {
	repo := &mockShopRepo{
		get: func(ctx context.Context, id int64) (*shopdomain.Shop, error) {
			return &shopdomain.Shop{ID: id, OwnerID: 2}, nil
		},
		softDelete: func(ctx context.Context, id, deletedAt int64) error { return nil },
	}
	uc := newTestShopUsecase(repo)
	require.NoError(t, uc.Delete(context.Background(), 2, false, 10))
	assert.Equal(t, []int64{10}, repo.deletedIDs)
}

func TestDelete_AdminAlwaysAllowed(t *testing.T) {
	repo := &mockShopRepo{
		softDelete: func(ctx context.Context, id, deletedAt int64) error { return nil },
	}
	uc := newTestShopUsecase(repo)
	require.NoError(t, uc.Delete(context.Background(), 0, true, 10))
}

func TestDelete_NonManagerForbidden(t *testing.T) {
	repo := &mockShopRepo{
		get: func(ctx context.Context, id int64) (*shopdomain.Shop, error) {
			return &shopdomain.Shop{ID: id, OwnerID: 1}, nil
		},
		getMembershipRole: func(ctx context.Context, shopID, userID int64) (shopdomain.MembershipRole, bool, error) {
			return shopdomain.MembershipNonAdmin, true, nil
		},
	}
	uc := newTestShopUsecase(repo)
	err := uc.Delete(context.Background(), 42, false, 10)
	assert.ErrorIs(t, err, sharederrors.ErrForbidden)
}

func TestAddMember_AllowedAndPassesRole(t *testing.T) {
	repo := &mockShopRepo{
		get: func(ctx context.Context, id int64) (*shopdomain.Shop, error) {
			return &shopdomain.Shop{ID: id, OwnerID: 1}, nil
		},
		addMember: func(ctx context.Context, shopID, userID int64, role shopdomain.MembershipRole) ([]shopdomain.Member, error) {
			return []shopdomain.Member{{ShopID: shopID, UserID: userID, Role: role}}, nil
		},
	}
	uc := newTestShopUsecase(repo)
	out, err := uc.AddMember(context.Background(), 1, false, 10, 55, shopdomain.MembershipAdmin)
	require.NoError(t, err)
	assert.Equal(t, shopdomain.MembershipAdmin, out[0].Role)
	assert.Equal(t, int64(55), repo.memberAddArgs.userID)
}

func TestRemoveMember_AdminMemberAllowed(t *testing.T) {
	repo := &mockShopRepo{
		getMembershipRole: func(ctx context.Context, shopID, userID int64) (shopdomain.MembershipRole, bool, error) {
			return shopdomain.MembershipAdmin, true, nil
		},
		removeMember: func(ctx context.Context, shopID, userID int64, requesterRole shopdomain.MembershipRole) error {
			return nil
		},
	}
	uc := newTestShopUsecase(repo)
	require.NoError(t, uc.RemoveMember(context.Background(), 42, false, 10, 55))
}

func TestRemoveMember_NonAdminMemberRejected(t *testing.T) {
	repo := &mockShopRepo{
		getMembershipRole: func(ctx context.Context, shopID, userID int64) (shopdomain.MembershipRole, bool, error) {
			return shopdomain.MembershipNonAdmin, true, nil
		},
	}
	uc := newTestShopUsecase(repo)
	err := uc.RemoveMember(context.Background(), 42, false, 10, 55)
	assert.ErrorIs(t, err, sharederrors.ErrForbidden)
}

func TestRemoveMember_PlatformAdminAllowed(t *testing.T) {
	repo := &mockShopRepo{
		removeMember: func(ctx context.Context, shopID, userID int64, requesterRole shopdomain.MembershipRole) error {
			return nil
		},
	}
	uc := newTestShopUsecase(repo)
	require.NoError(t, uc.RemoveMember(context.Background(), 0, true, 10, 55))
}

func TestListMembers_Delegates(t *testing.T) {
	members := []shopdomain.Member{{ShopID: 1, UserID: 2}}
	repo := &mockShopRepo{
		listMembers: func(ctx context.Context, shopID int64) ([]shopdomain.Member, error) { return members, nil },
	}
	uc := newTestShopUsecase(repo)
	out, err := uc.ListMembers(context.Background(), 1)
	require.NoError(t, err)
	assert.Len(t, out, 1)
}

func TestListProducts_Delegates(t *testing.T) {
	prods := []productdomain.ShopProduct{{ProductID: 5, ProductName: "Apple"}}
	repo := &mockShopRepo{
		listProducts: func(ctx context.Context, shopID int64) ([]productdomain.ShopProduct, error) { return prods, nil },
	}
	uc := newTestShopUsecase(repo)
	out, err := uc.ListProducts(context.Background(), 3)
	require.NoError(t, err)
	assert.Equal(t, "Apple", out[0].ProductName)
}

func TestUpdate_RepoErrorPropagates(t *testing.T) {
	boom := errors.New("db down")
	repo := &mockShopRepo{
		get: func(ctx context.Context, id int64) (*shopdomain.Shop, error) {
			return &shopdomain.Shop{ID: id, OwnerID: 5}, nil
		},
		update: func(ctx context.Context, id int64, fields map[string]any, updatedAt int64) (*shopdomain.Shop, error) {
			return nil, boom
		},
	}
	uc := newTestShopUsecase(repo)
	_, err := uc.Update(context.Background(), 5, false, 10, usecase.UpdateInput{Name: ptr("X")})
	assert.ErrorIs(t, err, boom)
}

func ptr(s string) *string { return &s }
