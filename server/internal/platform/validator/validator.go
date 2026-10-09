package validator

import "github.com/go-playground/validator/v10"

// Validator wraps go-playground/validator so handlers validate DTO structs.
type Validator struct {
	validate *validator.Validate
}

// NewValidator returns a Validator with the default rules registered.
func NewValidator() *Validator {
	return &Validator{validate: validator.New()}
}

// ValidateStruct runs struct tags on the given DTO and returns an error
// describing the first failure.
func (v *Validator) ValidateStruct(s any) error {
	return v.validate.Struct(s)
}

// ValidateVar runs a single value through a struct tag expression.
func (v *Validator) ValidateVar(field any, tag string) error {
	return v.validate.Var(field, tag)
}
