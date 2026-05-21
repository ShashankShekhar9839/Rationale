package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBSSLMode  string

	JWTSecret string

	ServerPort string
}

var AppConfig Config

func LoadConfig() {

	err := godotenv.Load()

	if err != nil {
		log.Fatal("Error loading .env file")
	}

	AppConfig = Config{
		DBHost:     os.Getenv("DB_HOST"),
		DBPort:     os.Getenv("DB_PORT"),
		DBUser:     os.Getenv("DB_USER"),
		DBPassword: os.Getenv("DB_PASSWORD"),
		DBName:     os.Getenv("DB_NAME"),
		DBSSLMode:  os.Getenv("DB_SSLMODE"),

		JWTSecret: os.Getenv("JWT_SECRET"),

		ServerPort: os.Getenv("SERVER_PORT"),
	}
}