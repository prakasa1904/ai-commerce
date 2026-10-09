# AGENTS.md

## Overview

This repository is a standalone Go backend application.

The application MUST follow:

- Clean Architecture
- Separation of Concerns
- Dependency Inversion
- Testability
- Secure input handling
- Explicit and readable code

The goal is to keep business logic independent from frameworks, databases, and external services.

---

## Core Technology Choices

The backend MUST use the following libraries:

| Purpose | Library |
|---|---|
| HTTP framework | Fiber: `github.com/gofiber/fiber/v2` |
| Database ORM | GORM: `gorm.io/gorm` |
| Logging | Zap: `go.uber.org/zap` |
| Validation | Validator: `github.com/go-playground/validator/v10` |

Do NOT replace these with alternative libraries unless explicitly requested.

Forbidden alternatives:

- HTTP: Gin, Echo, Chi, direct `net/http` routing
- ORM: sqlx, ent, bun, raw SQL as the main persistence layer
- Logger: logrus, zerolog, standard `log` as the main logger

---

## Recommended Project Structure

Use a feature-first structure for large-scale applications.

Each feature owns its own domain, usecase, repository, and HTTP delivery code. This keeps related code close together and prevents large shared folders from becoming difficult to maintain.

```text
.
├── cmd/
│   └── api/
│       └── main.go
├── internal/
│   ├── app/
│   │   └── bootstrap.go
│   ├── config/
│   │   └── config.go
│   ├── platform/
│   │   ├── database/
│   │   │   └── gorm.go
│   │   ├── logger/
│   │   │   └── zap.go
│   │   └── validator/
│   │       └── validator.go
│   ├── shared/
│   │   ├── errors/
│   │   ├── response/
│   │   └── middleware/
│   └── features/
│       ├── user/
│       │   ├── domain/
│       │   │   ├── user.go
│       │   │   └── errors.go
│       │   ├── usecase/
│       │   │   ├── dto.go
│       │   │   └── user_usecase.go
│       │   ├── repository/
│       │   │   ├── model.go
│       │   │   ├── mapper.go
│       │   │   └── gorm_repository.go
│       │   └── delivery/
│       │       └── http/
│       │           ├── handler.go
│       │           ├── request.go
│       │           ├── response.go
│       │           └── routes.go
│       └── order/
│           ├── domain/
│           ├── usecase/
│           ├── repository/
│           └── delivery/
│               └── http/
├── migrations/
├── docs/
├── scripts/
├── go.mod
├── go.sum
└── AGENTS.md
```

### Folder Purpose

| Folder | Purpose |
|---|---|
| `cmd/api` | Thin executable entrypoint |
| `internal/app` | Application bootstrap and dependency wiring |
| `internal/config` | Configuration loading and validation |
| `internal/platform` | Shared infrastructure such as DB, logger, validator |
| `internal/shared` | Shared cross-feature utilities |
| `internal/features/<feature>/domain` | Feature business entities and domain errors |
| `internal/features/<feature>/usecase` | Feature application logic |
| `internal/features/<feature>/repository` | Feature persistence implementation |
| `internal/features/<feature>/delivery/http` | Feature Fiber handlers, routes, requests, responses |
| `migrations` | Database migration files |
| `docs` | Technical documentation |
| `scripts` | Developer and deployment scripts |

---

## Large-Scale Organization Rules

### Prefer Feature-First Organization

For large applications, organize by business feature first, then by layer.

Good:

```text
internal/features/user/usecase
internal/features/user/repository
internal/features/order/usecase
internal/features/order/repository
```

Avoid large global folders like this for mature systems:

```text
internal/usecase/user_usecase.go
internal/usecase/order_usecase.go
internal/repository/user_repository.go
internal/repository/order_repository.go
```

Large global folders become hard to navigate as the application grows.

### Feature Boundary Rules

Each feature should be understandable on its own.

A feature may contain:

- Domain models
- Usecases
- Repository implementations
- HTTP handlers
- Request/response DTOs
- Feature-specific tests

Avoid placing feature-specific logic in global shared packages.

### Shared Package Rules

Only put code in `internal/shared` when at least two features truly need it.

Allowed in `internal/shared`:

- Common error response helpers
- Middleware
- Pagination helpers
- Auth context helpers
- Small generic utilities

Not allowed in `internal/shared`:

- Feature business logic
- Feature-specific validation rules
- Feature-specific database models
- Feature-specific DTOs

### Platform Package Rules

Use `internal/platform` for infrastructure used by many features.

Examples:

```text
internal/platform/database
internal/platform/logger
internal/platform/validator
```

Platform code should not contain business rules.

---

## Architecture Rules

Dependencies must point inward.

Allowed direction:

```text
delivery/http -> usecase -> domain
repository    -> domain
infrastructure -> repository/usecase setup only
```

Forbidden:

- `domain` importing Fiber, GORM, Zap, or Validator
- `usecase` importing Fiber or GORM
- `repository` returning Fiber responses
- `delivery/http` containing business rules
- database models being used as HTTP responses

---

## Layer Responsibilities

### Domain Layer

The domain layer contains core business concepts.

Allowed:

- Entities
- Value objects
- Domain errors
- Business constants

Not allowed:

- Fiber
- GORM
- Zap
- HTTP status codes
- JSON request/response DTOs

Example:

```go
package domain

import "errors"

var ErrUserNotFound = errors.New("user not found")

type User struct {
    ID    string
    Email string
    Name  string
}
```

---

### Usecase Layer

The usecase layer contains application business logic.

Allowed:

- Interfaces for repositories
- Input/output structs
- Business workflows
- Calls to domain logic

Not allowed:

- Fiber context
- GORM queries
- HTTP response formatting

Example:

```go
package usecase

import (
    "context"

    "your-app/internal/domain"
)

type UserRepository interface {
    FindByID(ctx context.Context, id string) (*domain.User, error)
    Create(ctx context.Context, user *domain.User) error
}

type UserUsecase struct {
    repo UserRepository
}

func NewUserUsecase(repo UserRepository) *UserUsecase {
    return &UserUsecase{repo: repo}
}
```

---

### Repository Layer

The repository layer handles persistence.

Allowed:

- GORM
- SQL/database errors
- Mapping between GORM models and domain entities

Not allowed:

- Fiber
- HTTP status codes
- Request/response DTOs
- Business workflows that belong in usecases

---

### Delivery / HTTP Layer

The HTTP layer handles web input/output.

Allowed:

- Fiber
- Request DTOs
- Response DTOs
- Payload validation
- HTTP error mapping

Not allowed:

- GORM
- Database queries
- Business rules

---

## HTTP Framework: Fiber

The backend MUST use Fiber.

Package:

```go
github.com/gofiber/fiber/v2
```

### Rules

- Initialize the app with `fiber.New()`
- Define routes using Fiber routing
- Use `*fiber.Ctx` only in `internal/delivery/http`
- Do NOT use `net/http` directly for routing
- Do NOT introduce Gin, Echo, Chi, or other HTTP frameworks

Example route setup:

```go
package http

import "github.com/gofiber/fiber/v2"

func RegisterRoutes(app *fiber.App, userHandler *UserHandler) {
    api := app.Group("/api")

    users := api.Group("/users")
    users.Get("/:id", userHandler.GetUser)
    users.Post("/", userHandler.CreateUser)
}
```

---

## Input Validation & Payload Security

All external input MUST be validated before reaching the usecase layer.

Package:

```go
github.com/go-playground/validator/v10
```

### Validation Rules

Validate:

- Request bodies
- Path parameters
- Query parameters
- Headers used by the application

Security requirements:

- Do NOT trust client input
- Reject malformed JSON
- Reject invalid payloads early
- Use DTO structs with validation tags
- Apply length limits to strings
- Validate UUIDs, emails, enums, dates, URLs, and numeric ranges
- Do NOT expose stack traces or internal validation details
- Do NOT trust role, permission, owner, or tenant fields from request bodies
- Derive authenticated identity from auth middleware, not the payload

### Request DTO Example

```go
type CreateUserRequest struct {
    Email string `json:"email" validate:"required,email,max=255"`
    Name  string `json:"name" validate:"required,min=2,max=100"`
}
```

### Validator Wrapper

```go
package http

import "github.com/go-playground/validator/v10"

type Validator struct {
    validate *validator.Validate
}

func NewValidator() *Validator {
    return &Validator{validate: validator.New()}
}

func (v *Validator) Validate(input any) error {
    return v.validate.Struct(input)
}
```

### Handler Validation Example

```go
func (h *UserHandler) CreateUser(c *fiber.Ctx) error {
    var req CreateUserRequest

    if err := c.BodyParser(&req); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(ErrorResponse{
            Message: "invalid request body",
        })
    }

    if err := h.validator.Validate(req); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(ErrorResponse{
            Message: "invalid request payload",
        })
    }

    input := usecase.CreateUserInput{
        Email: req.Email,
        Name:  req.Name,
    }

    result, err := h.usecase.CreateUser(c.Context(), input)
    if err != nil {
        return h.handleError(c, err)
    }

    return c.Status(fiber.StatusCreated).JSON(result)
}
```

---

## Database Interaction with GORM

The backend MUST use GORM for database interaction.

Packages:

```go
gorm.io/gorm
gorm.io/driver/postgres
```

Use the correct GORM driver for the chosen database.

### Where GORM Is Allowed

GORM may be used only in:

```text
internal/repository/
internal/infrastructure/database/
```

GORM must NOT be used in:

```text
internal/domain/
internal/usecase/
internal/delivery/http/
```

### Database Initialization

```go
package database

import (
    "fmt"

    "go.uber.org/zap"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

func NewGormDB(dsn string, logger *zap.Logger) (*gorm.DB, error) {
    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        logger.Error("failed to connect to database", zap.Error(err))
        return nil, fmt.Errorf("connect database: %w", err)
    }

    return db, nil
}
```

### GORM Model Example

Use separate GORM models for database tables.
Do NOT add GORM tags to domain entities.

```go
package repository

import "time"

type UserModel struct {
    ID        string `gorm:"primaryKey;column:id"`
    Email     string `gorm:"uniqueIndex;column:email"`
    Name      string `gorm:"column:name"`
    CreatedAt time.Time
    UpdatedAt time.Time
}

func (UserModel) TableName() string {
    return "users"
}
```

### Mapping Example

```go
func toDomainUser(model UserModel) *domain.User {
    return &domain.User{
        ID:    model.ID,
        Email: model.Email,
        Name:  model.Name,
    }
}

func toUserModel(user *domain.User) UserModel {
    return UserModel{
        ID:    user.ID,
        Email: user.Email,
        Name:  user.Name,
    }
}
```

### Repository Implementation Example

```go
package repository

import (
    "context"
    "errors"
    "fmt"

    "go.uber.org/zap"
    "gorm.io/gorm"

    "your-app/internal/domain"
)

type UserRepository struct {
    db     *gorm.DB
    logger *zap.Logger
}

func NewUserRepository(db *gorm.DB, logger *zap.Logger) *UserRepository {
    return &UserRepository{db: db, logger: logger}
}

func (r *UserRepository) FindByID(ctx context.Context, id string) (*domain.User, error) {
    var model UserModel

    err := r.db.WithContext(ctx).
        Where("id = ?", id).
        First(&model).Error

    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, domain.ErrUserNotFound
        }

        r.logger.Error("failed to find user by id",
            zap.String("user_id", id),
            zap.Error(err),
        )

        return nil, fmt.Errorf("find user by id %s: %w", id, err)
    }

    return toDomainUser(model), nil
}

func (r *UserRepository) Create(ctx context.Context, user *domain.User) error {
    model := toUserModel(user)

    err := r.db.WithContext(ctx).Create(&model).Error
    if err != nil {
        r.logger.Error("failed to create user",
            zap.String("user_id", user.ID),
            zap.Error(err),
        )

        return fmt.Errorf("create user %s: %w", user.ID, err)
    }

    return nil
}
```

### GORM Rules

- Always use `WithContext(ctx)`
- Keep GORM inside repository/infrastructure layers
- Do NOT expose `*gorm.DB` to handlers or usecases
- Do NOT put GORM tags on domain entities
- Convert `gorm.ErrRecordNotFound` into a domain error
- Wrap unexpected DB errors with context
- Log unexpected DB errors with zap
- Do NOT log sensitive query values

---

## Migrations

For early development, `AutoMigrate` is acceptable.

```go
err := db.AutoMigrate(&repository.UserModel{})
if err != nil {
    logger.Error("database migration failed", zap.Error(err))
    return fmt.Errorf("run database migrations: %w", err)
}
```

For production systems, prefer versioned migrations using a migration tool.

Migration files should live in:

```text
migrations/
```

---

## Transactions

Use transactions when multiple database writes must succeed or fail together.

```go
err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
    if err := tx.Create(&userModel).Error; err != nil {
        return fmt.Errorf("create user: %w", err)
    }

    if err := tx.Create(&profileModel).Error; err != nil {
        return fmt.Errorf("create profile: %w", err)
    }

    return nil
})
```

Rules:

- Keep transaction scope small
- Return errors to trigger rollback
- Do not perform slow external API calls inside a DB transaction

---

## Error Handling

Error handling MUST be explicit, predictable, and observable.

### General Rules

- Return errors; do NOT panic for normal application failures
- Wrap errors with meaningful context using `%w`
- Do NOT swallow errors silently
- Do NOT return raw database, framework, or infrastructure errors directly to clients
- Convert internal errors into safe HTTP responses in the delivery layer
- Prefer typed/domain errors for expected business failures

Example:

```go
return fmt.Errorf("get user by id %s: %w", id, err)
```

### Typed Errors

Use typed errors for common business cases:

```go
var ErrUserNotFound = errors.New("user not found")
var ErrInvalidInput = errors.New("invalid input")
```

Use `errors.Is` and `errors.As` to classify errors.

```go
if errors.Is(err, domain.ErrUserNotFound) {
    return c.Status(fiber.StatusNotFound).JSON(ErrorResponse{
        Message: "user not found",
    })
}
```

### Error Boundaries

- Domain layer defines business errors
- Usecase layer returns domain/application errors
- Repository layer wraps infrastructure errors
- Delivery layer maps errors to HTTP responses

---

## Logging with Zap

The backend MUST use Zap for structured logging.

Package:

```go
go.uber.org/zap
```

### Logging Rules

- Use structured fields, not string concatenation
- Do NOT log sensitive data such as passwords, tokens, secrets, or raw authorization headers
- Do NOT log inside the domain layer
- Prefer logging at application boundaries: delivery, middleware, repository, startup, shutdown
- Avoid duplicate logging of the same error across multiple layers

Example:

```go
logger.Error("failed to get user",
    zap.String("user_id", id),
    zap.Error(err),
)
```

### Zap Initialization

```go
package logger

import "go.uber.org/zap"

func NewLogger(env string) (*zap.Logger, error) {
    if env == "development" {
        return zap.NewDevelopment()
    }

    return zap.NewProduction()
}
```

Use it in `main.go`:

```go
logger, err := logger.NewLogger(cfg.AppEnv)
if err != nil {
    panic(err)
}
defer logger.Sync()
```

---

## HTTP Error Response Format

Use a consistent error response format.

```go
type ErrorResponse struct {
    Message string            `json:"message"`
    Fields  map[string]string `json:"fields,omitempty"`
}
```

Rules:

- Keep messages safe for clients
- Do NOT expose stack traces
- Do NOT expose raw SQL/database errors
- Do NOT expose internal package names

---

## DTO & Mapping Rules

- Use DTOs for request and response bodies
- Do NOT expose domain entities directly as HTTP responses
- Do NOT expose GORM models as HTTP responses
- Map explicitly between layers

Example response DTO:

```go
type UserResponse struct {
    ID    string `json:"id"`
    Email string `json:"email"`
    Name  string `json:"name"`
}

func toUserResponse(user *domain.User) UserResponse {
    return UserResponse{
        ID:    user.ID,
        Email: user.Email,
        Name:  user.Name,
    }
}
```

---

## Configuration

Application configuration should be loaded once at startup.

Recommended location:

```text
internal/config/config.go
```

Rules:

- Do NOT hardcode secrets
- Read configuration from environment variables
- Validate required configuration at startup
- Do NOT pass the entire config object everywhere if only one value is needed

Example:

```go
type Config struct {
    AppEnv      string
    Port        string
    DatabaseDSN string
}
```

---

## Main Application Startup

`cmd/api/main.go` should wire dependencies together.

Responsibilities:

- Load config
- Initialize logger
- Connect database
- Initialize repositories
- Initialize usecases
- Initialize handlers
- Register routes
- Start Fiber server

Do NOT put business logic in `main.go`.

Example flow:

```go
func main() {
    cfg := config.Load()

    log, err := logger.NewLogger(cfg.AppEnv)
    if err != nil {
        panic(err)
    }
    defer log.Sync()

    db, err := database.NewGormDB(cfg.DatabaseDSN, log)
    if err != nil {
        log.Fatal("database initialization failed", zap.Error(err))
    }

    userRepo := repository.NewUserRepository(db, log)
    userUsecase := usecase.NewUserUsecase(userRepo)
    validator := http.NewValidator()
    userHandler := http.NewUserHandler(userUsecase, validator, log)

    app := fiber.New()
    http.RegisterRoutes(app, userHandler)

    if err := app.Listen(":" + cfg.Port); err != nil {
        log.Fatal("server failed", zap.Error(err))
    }
}
```

---

## Testing

Testing is required for business logic.

### Rules

- Unit test usecases
- Mock repository interfaces
- Test validation rules where useful
- Test repository behavior with integration tests when database access is needed
- Do NOT require Fiber for usecase tests

### What to Prioritize

1. Usecase tests
2. Domain logic tests
3. Repository integration tests
4. HTTP handler tests

---

## Code Style

Follow standard Go conventions.

Rules:

- Use `gofmt`
- Use meaningful names
- Prefer small functions
- Avoid deep nesting
- Return early when possible
- Keep interfaces small
- Accept interfaces, return structs where practical
- Avoid global mutable state
- Avoid magic strings and magic numbers

---

## Security Rules

- Validate all external input
- Never trust client-provided identity, role, permission, owner, or tenant values
- Never log secrets or tokens
- Never expose internal errors to clients
- Use context-aware database operations
- Keep dependencies updated
- Avoid unnecessary public packages
- Use least privilege for database users and external credentials

---

## Agent Behavior Rules

When modifying this repository, agents MUST:

- Respect the existing architecture
- Keep Fiber in the delivery layer only
- Keep GORM in repository/infrastructure only
- Keep business logic in usecases/domain
- Use Zap for logging
- Use Validator for payload validation
- Add tests for new usecase behavior
- Avoid large unrelated refactors
- Prefer clear, beginner-readable code over clever abstractions

Before adding a new dependency, agents should verify that the existing required libraries cannot solve the problem.

---

## Summary

This repository is a standalone Go backend using:

- Fiber for HTTP
- GORM for database access
- Zap for structured logging
- Validator for input validation
- Clean Architecture for maintainability

Keep framework, database, and infrastructure details outside business logic.

