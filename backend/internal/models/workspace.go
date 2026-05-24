package models

import "gorm.io/gorm"

type Workspace struct {
	gorm.Model

	Name           string `gorm:"not null"`
	Description    string
	OrganizationID uint   `gorm:"not null"`

	Organization Organization `gorm:"foreignKey:OrganizationID"`
}