package models

import "gorm.io/gorm"

type Project struct {
	gorm.Model

	Name        string `gorm:"not null"`
	Description string

	WorkspaceID uint `gorm:"not null"`
}