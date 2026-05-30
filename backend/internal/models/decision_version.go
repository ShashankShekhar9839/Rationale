package models

import "gorm.io/gorm"

type DecisionVersion struct {
	gorm.Model

	VersionNumber uint   `gorm:"not null"`
	Label         string
	Content       string `gorm:"type:text"`

	DecisionID uint `gorm:"not null"`
}