package models

import "gorm.io/gorm"

type Project struct {
	gorm.Model

	Name        string `gorm:"not null"`
	Description string

	WorkspaceID uint `gorm:"not null"`
	CreatedByID *uint
	UpdatedByID *uint

	CreatedBy User `gorm:"foreignKey:CreatedByID"`
	UpdatedBy User `gorm:"foreignKey:UpdatedByID"`
}
