package models

import "gorm.io/gorm"

type DecisionVersion struct {
	gorm.Model

	VersionNumber uint `gorm:"not null"`
	Label         string
	Content       string `gorm:"type:text"`

	DecisionID  uint `gorm:"not null"`
	CreatedByID *uint
	UpdatedByID *uint

	CreatedBy User `gorm:"foreignKey:CreatedByID"`
	UpdatedBy User `gorm:"foreignKey:UpdatedByID"`
}
