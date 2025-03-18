import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";

export const appDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  username: process.env.DATABASE_USERNAME || "postgres",
  password: process.env.DATABASE_PASSWORD || "postgres",
  database: process.env.DATABASE_NAME || "test_db",
  // synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  entities: [User],
  // entities: ["src/entities/*.ts"],
  migrations: [__dirname + "/migrations/**/*.{js,ts}"],
  subscribers: ["src/subscriber/**/*.ts"],
});
