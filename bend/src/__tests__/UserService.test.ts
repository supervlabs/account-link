import { UserService } from "../services/UserService";
import { run, app } from "../app";
describe("UserService", () => {
  let server: Awaited<ReturnType<typeof run>>;
  let userService: UserService;

  beforeAll(async () => {
    server = await run({ port: 0 });
    userService = new UserService();
  });

  afterAll(async () => {
    await server.shutdown();
  });

  it("should create a new user", async () => {
    const userData = {
      firstName: "Alice",
      lastName: "Doe",
      email: "d@example.com",
      password: "password123",
    };

    const user = await userService.create(userData);
    expect(user).toBeDefined();
    expect(user.email).toBe(userData.email);
  });

  it("should find user by id", async () => {
    const userData = {
      firstName: "Alice",
      lastName: "Doe",
      email: "c@example.com",
      password: "password123",
    };

    const createdUser = await userService.create(userData);
    const foundUser = await userService.findOne(createdUser.id);

    expect(foundUser).toBeDefined();
    expect(foundUser?.email).toBe(userData.email);
  });
});
