import request from "supertest";
import { run, app } from "../app";

describe("API Routes", () => {
  let server: Awaited<ReturnType<typeof run>>;
  beforeAll(async () => {
    server = await run({ port: 0 });
  });

  afterAll(async () => {
    await server.shutdown();
  });

  describe("GET /status", () => {
    it("should return status OK", async () => {
      const response = await request(app).get("/status");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: "ok" });
    });
  });
});
