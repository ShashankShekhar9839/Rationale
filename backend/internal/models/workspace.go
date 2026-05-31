package models

import "gorm.io/gorm"

type Workspace struct {
	gorm.Model

	Name           string `gorm:"not null"`
	Description    string
	OrganizationID uint `gorm:"not null"`
	CreatedByID    *uint
	UpdatedByID    *uint

	Organization Organization `gorm:"foreignKey:OrganizationID"`
	CreatedBy    User         `gorm:"foreignKey:CreatedByID"`
	UpdatedBy    User         `gorm:"foreignKey:UpdatedByID"`
}
