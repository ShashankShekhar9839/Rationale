package models

import "gorm.io/gorm"

type Decision struct {
	gorm.Model

	Title       string `gorm:"not null"`
	Description string

	ProjectID   uint `gorm:"not null"`
	CreatedByID *uint
	UpdatedByID *uint

	CreatedBy User `gorm:"foreignKey:CreatedByID"`
	UpdatedBy User `gorm:"foreignKey:UpdatedByID"`
}
