package models

import "gorm.io/gorm"

type Organization struct {
	gorm.Model

	Name        string `gorm:"not null"`
	Description string

	OwnerID uint `gorm:"not null"`

	Owner User `gorm:"foreignKey:OwnerID"`
}