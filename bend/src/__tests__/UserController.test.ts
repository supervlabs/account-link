import request from "supertest";
import { run, app } from "../app";
import { User } from "../entities/User";

describe("User API", () => {
  let server: Awaited<ReturnType<typeof run>>;
  beforeAll(async () => {
    server = await run({ port: 0 });
    await server.dataSource.runMigrations();
    await server.dataSource.getRepository(User).clear();
  });

  afterAll(async () => {
    await server.shutdown();
  });

  it("should create a new user", async () => {
    const userData = {
      firstName: "A",
      lastName: "Doe",
      email: "A@example.com",
      password: "password123",
    };

    const response = await request(app).post("/users").send(userData);

    expect(response.status).toBe(201);
    expect(response.body.email).toBe(userData.email);
  });

  it("should get all users", async () => {
    const response = await request(app).get("/users");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
