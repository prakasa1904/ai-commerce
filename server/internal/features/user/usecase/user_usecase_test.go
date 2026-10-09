package usecase_test

import (
	"context"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"

	"github.com/prakasa1904/ai-commerce/internal/features/user/domain"
	"github.com/prakasa1904/ai-commerce/internal/features/user/usecase"
	sharederrors "github.com/prakasa1904/ai-commerce/internal/shared/errors"
	"github.com/prakasa1904/ai-commerce/internal/shared/jwt"
)

type mockUserRepo struct {
	findActiveByEmail func(ctx context.Context, email string) (*domain.User, error)
	findActiveByID    func(ctx context.Context, id int64) (*domain.User, error)
	emailTaken        func(ctx context.Context, email string) (bool, error)
	countActive       func(ctx context.Context) (int64, error)
	list              func(ctx context.Context, includeDeleted bool, query string) ([]domain.User, error)
	create            func(ctx context.Context, user *domain.User) (*domain.User, error)
	setPartials       func(ctx context.Context, id int64, fields map[string]any, updatedAt int64) (*domain.User, error)
	softDelete        func(ctx context.Context, id, deletedAt int64) error
	restore           func(ctx context.Context, id, updatedAt int64) error

	created     *domain.User
	partialsSet map[string]any
}

func (m *mockUserRepo) FindActiveByEmail(ctx context.Context, email string) (*domain.User, error) {
	return m.findActiveByEmail(ctx, email)
}
func (m *mockUserRepo) FindActiveByID(ctx context.Context, id int64) (*domain.User, error) {
	return m.findActiveByID(ctx, id)
}
func (m *mockUserRepo) EmailTaken(ctx context.Context, email string) (bool, error) {
	return m.emailTaken(ctx, email)
}
func (m *mockUserRepo) CountActive(ctx context.Context) (int64, error) {
	return m.countActive(ctx)
}
func (m *mockUserRepo) List(ctx context.Context, includeDeleted bool, query string) ([]domain.User, error) {
	return m.list(ctx, includeDeleted, query)
}
func (m *mockUserRepo) Create(ctx context.Context, user *domain.User) (*domain.User, error) {
	m.created = user
	return m.create(ctx, user)
}
func (m *mockUserRepo) SetPartials(ctx context.Context, id int64, fields map[string]any, updatedAt int64) (*domain.User, error) {
	m.partialsSet = fields
	return m.setPartials(ctx, id, fields, updatedAt)
}
func (m *mockUserRepo) SoftDelete(ctx context.Context, id, deletedAt int64) error {
	return m.softDelete(ctx, id, deletedAt)
}
func (m *mockUserRepo) Restore(ctx context.Context, id, updatedAt int64) error {
	return m.restore(ctx, id, updatedAt)
}

type mockCleaner struct {
	softDeleteShopsByOwner      func(ctx context.Context, ownerID, deletedAt int64) error
	softDeleteProductsByOwner   func(ctx context.Context, ownerID, deletedAt int64) error
	softDeleteMembershipsByUser func(ctx context.Context, userID, deletedAt int64) error
}

func (m *mockCleaner) SoftDeleteShopsByOwner(ctx context.Context, ownerID, deletedAt int64) error {
	return m.softDeleteShopsByOwner(ctx, ownerID, deletedAt)
}
func (m *mockCleaner) SoftDeleteProductsByOwner(ctx context.Context, ownerID, deletedAt int64) error {
	return m.softDeleteProductsByOwner(ctx, ownerID, deletedAt)
}
func (m *mockCleaner) SoftDeleteMembershipsByUser(ctx context.Context, userID, deletedAt int64) error {
	return m.softDeleteMembershipsByUser(ctx, userID, deletedAt)
}

type mockSigner struct {
	sign       func(*jwt.Claims) (string, error)
	lastClaims *jwt.Claims
}

func (m *mockSigner) Sign(claims *jwt.Claims) (string, error) {
	m.lastClaims = claims
	return m.sign(claims)
}

type mockPasswordHasher struct {
	hash    func(string) (string, error)
	hashArg string
	compare func(plain, hash string) bool
}

func (m *mockPasswordHasher) Hash(plain string) (string, error) {
	m.hashArg = plain
	return m.hash(plain)
}
func (m *mockPasswordHasher) Compare(plain, hash string) bool {
	return m.compare(plain, hash)
}

func newTestUsecase(repo usecase.UserRepository, cleaner usecase.RelationshipsCleaner, signer usecase.TokenSigner, hasher usecase.PasswordHasher) *usecase.UserUsecase {
	return usecase.NewUserUsecase(repo, cleaner, signer, hasher, zap.NewNop())
}

func TestRegister_Success(t *testing.T) {
	repo := &mockUserRepo{
		emailTaken: func(ctx context.Context, email string) (bool, error) { return false, nil },
		create:     func(ctx context.Context, user *domain.User) (*domain.User, error) { return user, nil },
	}
	signer := &mockSigner{sign: func(*jwt.Claims) (string, error) { return "token", nil }}
	hasher := &mockPasswordHasher{hash: func(s string) (string, error) { return "hash", nil }}

	uc := newTestUsecase(repo, &mockCleaner{}, signer, hasher)

	session, err := uc.Register(context.Background(), usecase.RegisterInput{
		Username: " alice ", Name: "", Email: "ALICE@example.com", Password: "secret", Role: domain.RoleSeller,
	})
	require.NoError(t, err)
	assert.Equal(t, "token", session.Token)
	assert.Equal(t, "alice", session.User.Username)
	assert.Equal(t, "alice", session.User.Name, "empty name falls back to username")
	assert.Equal(t, "alice@example.com", session.User.Email, "email is normalized")
	assert.Equal(t, domain.RoleSeller, session.User.Role)
	assert.Equal(t, "secret", hasher.hashArg, "password hash is passed to hasher")
	assert.Equal(t, "hash", repo.created.Password, "stored user carries the bcrypt hash")
	assert.Equal(t, "alice", signer.lastClaims.Username)
	assert.True(t, repo.created.CreatedAt > 0)
}

func TestRegister_DefaultsToBuyerRole(t *testing.T) {
	repo := &mockUserRepo{
		emailTaken: func(ctx context.Context, email string) (bool, error) { return false, nil },
		create:     func(ctx context.Context, user *domain.User) (*domain.User, error) { return user, nil },
	}
	uc := newTestUsecase(repo, &mockCleaner{}, &mockSigner{sign: func(*jwt.Claims) (string, error) { return "t", nil }}, &mockPasswordHasher{hash: func(s string) (string, error) { return "h", nil }})

	session, err := uc.Register(context.Background(), usecase.RegisterInput{Username: "bob", Email: "bob@example.com", Password: "pw"})
	require.NoError(t, err)
	assert.Equal(t, domain.RoleBuyer, session.User.Role)
}

func TestRegister_EmailExists(t *testing.T) {
	repo := &mockUserRepo{
		emailTaken: func(ctx context.Context, email string) (bool, error) { return true, nil },
	}
	uc := newTestUsecase(repo, &mockCleaner{},
		&mockSigner{sign: func(*jwt.Claims) (string, error) { return "t", nil }},
		&mockPasswordHasher{hash: func(s string) (string, error) { return "h", nil }})

	_, err := uc.Register(context.Background(), usecase.RegisterInput{Username: "bob", Email: "bob@example.com", Password: "pw"})
	assert.ErrorIs(t, err, domain.ErrEmailExists)
}

func TestRegister_HashFailure(t *testing.T) {
	repo := &mockUserRepo{
		emailTaken: func(ctx context.Context, email string) (bool, error) { return false, nil },
	}
	uc := newTestUsecase(repo, &mockCleaner{},
		&mockSigner{sign: func(*jwt.Claims) (string, error) { return "t", nil }},
		&mockPasswordHasher{hash: func(s string) (string, error) { return "", errors.New("boom") }})

	_, err := uc.Register(context.Background(), usecase.RegisterInput{Username: "bob", Email: "bob@example.com", Password: "pw"})
	assert.Error(t, err)
}

func TestLogin_Success(t *testing.T) {
	user := &domain.User{ID: 7, Username: "alice", Name: "Alice", Email: "alice@example.com", Password: "hash", Role: domain.RoleSeller}
	repo := &mockUserRepo{
		findActiveByEmail: func(ctx context.Context, email string) (*domain.User, error) { return user, nil },
	}
	signer := &mockSigner{sign: func(*jwt.Claims) (string, error) { return "tok", nil }}
	hasher := &mockPasswordHasher{compare: func(plain, hash string) bool { return plain == "pw" && hash == "hash" }}

	uc := newTestUsecase(repo, &mockCleaner{}, signer, hasher)
	session, err := uc.Login(context.Background(), usecase.LoginInput{Email: "ALICE@EXAMPLE.COM", Password: "pw"})
	require.NoError(t, err)
	assert.Equal(t, "tok", session.Token)
	assert.Equal(t, int64(7), session.User.ID)
	assert.Equal(t, "alice", session.User.Username)
}

func TestLogin_InvalidCredentials(t *testing.T) {
	repo := &mockUserRepo{
		findActiveByEmail: func(ctx context.Context, email string) (*domain.User, error) {
			return nil, domain.ErrUserNotFound
		},
	}
	uc := newTestUsecase(repo, &mockCleaner{},
		&mockSigner{sign: func(*jwt.Claims) (string, error) { return "tok", nil }},
		&mockPasswordHasher{})

	_, err := uc.Login(context.Background(), usecase.LoginInput{Email: "nope@example.com", Password: "pw"})
	assert.ErrorIs(t, err, domain.ErrInvalidCredentials)
}

func TestLogin_WrongPassword(t *testing.T) {
	repo := &mockUserRepo{
		findActiveByEmail: func(ctx context.Context, email string) (*domain.User, error) {
			return &domain.User{ID: 1, Email: "a@b.c", Password: "hash"}, nil
		},
	}
	uc := newTestUsecase(repo, &mockCleaner{},
		&mockSigner{sign: func(*jwt.Claims) (string, error) { return "tok", nil }},
		&mockPasswordHasher{compare: func(plain, hash string) bool { return false }})

	_, err := uc.Login(context.Background(), usecase.LoginInput{Email: "a@b.c", Password: "wrong"})
	assert.ErrorIs(t, err, domain.ErrInvalidCredentials)
}

func TestMe_SuccessAndNotFound(t *testing.T) {
	user := &domain.User{ID: 3, Username: "carol", Email: "c@x.y", Role: domain.RoleBuyer}
	repo := &mockUserRepo{
		findActiveByID: func(ctx context.Context, id int64) (*domain.User, error) {
			if id == 3 {
				return user, nil
			}
			return nil, domain.ErrUserNotFound
		},
	}
	uc := newTestUsecase(repo, &mockCleaner{},
		&mockSigner{sign: func(*jwt.Claims) (string, error) { return "t", nil }},
		&mockPasswordHasher{})

	claims := &jwt.Claims{ID: 3}
	public, err := uc.Me(context.Background(), claims)
	require.NoError(t, err)
	assert.Equal(t, int64(3), public.ID)

	_, err = uc.Me(context.Background(), &jwt.Claims{ID: 999})
	assert.ErrorIs(t, err, domain.ErrUserNotFound)
}

func TestListUsers_MapsToPublic(t *testing.T) {
	input := []domain.User{
		{ID: 1, Username: "u1", Name: "U One", Email: "u1@x.y", Password: "super-secret"},
		{ID: 2, Username: "u2", Name: "U Two", Email: "u2@x.y", Role: domain.RoleSeller},
	}
	var gotDeleted bool
	var gotQuery string
	repo := &mockUserRepo{
		list: func(ctx context.Context, includeDeleted bool, query string) ([]domain.User, error) {
			gotDeleted, gotQuery = includeDeleted, query
			return input, nil
		},
	}
	uc := newTestUsecase(repo, &mockCleaner{},
		&mockSigner{sign: func(*jwt.Claims) (string, error) { return "t", nil }},
		&mockPasswordHasher{})

	out, err := uc.ListUsers(context.Background(), usecase.ListUsersOptions{IncludeDeleted: true, Query: "u1"})
	require.NoError(t, err)
	require.Len(t, out, 2)
	assert.True(t, gotDeleted)
	assert.Equal(t, "u1", gotQuery)
	assert.Equal(t, []string{"U One", "U Two"}, []string{out[0].Name, out[1].Name})
}

func TestGetUser_ForbiddenForNonAdmin(t *testing.T) {
	uc := newTestUsecase(&mockUserRepo{}, &mockCleaner{},
		&mockSigner{sign: func(*jwt.Claims) (string, error) { return "t", nil }},
		&mockPasswordHasher{})

	_, err := uc.GetUser(context.Background(), false, 1)
	assert.ErrorIs(t, err, sharederrors.ErrForbidden)
}

func TestCreateUser_AdminSuccess(t *testing.T) {
	repo := &mockUserRepo{
		emailTaken: func(ctx context.Context, email string) (bool, error) { return false, nil },
		create:     func(ctx context.Context, user *domain.User) (*domain.User, error) { return user, nil },
	}
	uc := newTestUsecase(repo, &mockCleaner{},
		&mockSigner{sign: func(*jwt.Claims) (string, error) { return "t", nil }},
		&mockPasswordHasher{hash: func(s string) (string, error) { return "h", nil }})

	out, err := uc.CreateUser(context.Background(), true, usecase.CreateUserInput{
		Username: "dave", Name: "Dave", Email: "d@x.y", Password: "pw", Role: domain.RoleSeller, IsAdmin: true,
	})
	require.NoError(t, err)
	assert.Equal(t, domain.RoleSeller, out.Role)
	assert.True(t, out.IsAdmin)
	assert.Equal(t, "h", repo.created.Password)
	assert.NotZero(t, repo.created.CreatedAt)
}

func TestCreateUser_ForbiddenForNonAdmin(t *testing.T) {
	uc := newTestUsecase(&mockUserRepo{}, &mockCleaner{},
		&mockSigner{sign: func(*jwt.Claims) (string, error) { return "t", nil }},
		&mockPasswordHasher{})

	_, err := uc.CreateUser(context.Background(), false, usecase.CreateUserInput{})
	assert.ErrorIs(t, err, sharederrors.ErrForbidden)
}

func TestCreateUser_EmailExists(t *testing.T) {
	repo := &mockUserRepo{
		emailTaken: func(ctx context.Context, email string) (bool, error) { return true, nil },
	}
	uc := newTestUsecase(repo, &mockCleaner{},
		&mockSigner{sign: func(*jwt.Claims) (string, error) { return "t", nil }},
		&mockPasswordHasher{})

	_, err := uc.CreateUser(context.Background(), true, usecase.CreateUserInput{Email: "e@x.y"})
	assert.ErrorIs(t, err, domain.ErrEmailExists)
}

func TestUpdateUser_BuildsPartials(t *testing.T) {
	user := &domain.User{ID: 5, Username: "eve", Email: "e@x.y"}
	repo := &mockUserRepo{
		setPartials: func(ctx context.Context, id int64, fields map[string]any, updatedAt int64) (*domain.User, error) {
			return user, nil
		},
	}
	uc := newTestUsecase(repo, &mockCleaner{},
		&mockSigner{sign: func(*jwt.Claims) (string, error) { return "t", nil }},
		&mockPasswordHasher{})

	role := domain.RoleSeller
	_, err := uc.UpdateUser(context.Background(), true, 5, usecase.UpdateUserInput{
		Username: "eve2", Email: "E@X.Y", Role: role, IsAdmin: true,
	})
	require.NoError(t, err)
	assert.Equal(t, "eve2", repo.partialsSet["username"])
	assert.Equal(t, "e@x.y", repo.partialsSet["email"])
	assert.Equal(t, "seller", repo.partialsSet["role"])
	assert.Equal(t, 1, repo.partialsSet["is_admin"])
}

func TestUpdateUser_ForbiddenForNonAdmin(t *testing.T) {
	uc := newTestUsecase(&mockUserRepo{}, &mockCleaner{},
		&mockSigner{sign: func(*jwt.Claims) (string, error) { return "t", nil }},
		&mockPasswordHasher{})

	_, err := uc.UpdateUser(context.Background(), false, 1, usecase.UpdateUserInput{})
	assert.ErrorIs(t, err, sharederrors.ErrForbidden)
}

func TestSoftDeleteUser_ForbiddenForNonAdmin(t *testing.T) {
	uc := newTestUsecase(&mockUserRepo{}, &mockCleaner{},
		&mockSigner{sign: func(*jwt.Claims) (string, error) { return "t", nil }},
		&mockPasswordHasher{})

	err := uc.SoftDeleteUser(context.Background(), false, 1)
	assert.ErrorIs(t, err, sharederrors.ErrForbidden)
}

func TestSoftDeleteUser_CascadeAndDelete(t *testing.T) {
	repo := &mockUserRepo{
		softDelete: func(ctx context.Context, id, deletedAt int64) error { return nil },
	}
	cleaner := &mockCleaner{
		softDeleteShopsByOwner:      func(ctx context.Context, ownerID, deletedAt int64) error { return nil },
		softDeleteProductsByOwner:   func(ctx context.Context, ownerID, deletedAt int64) error { return nil },
		softDeleteMembershipsByUser: func(ctx context.Context, userID, deletedAt int64) error { return nil },
	}

	var deletedID int64
	var deletedAt int64
	cleaner.softDeleteMembershipsByUser = func(ctx context.Context, userID, deletedAtIn int64) error {
		return nil
	}
	repo.softDelete = func(ctx context.Context, id, deletedAtIn int64) error {
		deletedID, deletedAt = id, deletedAtIn
		return nil
	}

	uc := newTestUsecase(repo, cleaner,
		&mockSigner{sign: func(*jwt.Claims) (string, error) { return "t", nil }},
		&mockPasswordHasher{})

	require.NoError(t, uc.SoftDeleteUser(context.Background(), true, 42))
	assert.Equal(t, int64(42), deletedID)
	assert.True(t, deletedAt > 0)
}
