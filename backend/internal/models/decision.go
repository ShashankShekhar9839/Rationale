package models

import "gorm.io/gorm"

type Decision struct {
	gorm.Model

	Title       string `gorm:"not null"`
	Description string

	ProjectID uint `gorm:"not null"`
}