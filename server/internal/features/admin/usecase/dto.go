package usecase

import "context"

// Stats is the admin dashboard counts snapshot.
type Stats struct {
	Users           int64 `json:"users"`
	ActiveUsers     int64 `json:"activeUsers"`
	Shops           int64 `json:"shops"`
	Products        int64 `json:"products"`
	Memberships     int64 `json:"memberships"`
	DeletedUsers    int64 `json:"deletedUsers"`
	DeletedShops    int64 `json:"deletedShops"`
	DeletedProducts int64 `json:"deletedProducts"`
}

// StatisticsCollector evaluates the admin counts.
type StatisticsCollector interface {
	Collect(ctx context.Context) (Stats, error)
}
