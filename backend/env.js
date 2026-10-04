import dotenv from "dotenv";

dotenv.config();

const env = {
  PORT: Number(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",

  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/store_rating_platform",

  JWT_SECRET: process.env.JWT_SECRET,
};

export default env;