import { asyncifyRouter } from "../utils/asyncify";
import { verifyToken } from "../middleware/auth";
import { UserController } from "../controllers/UserController";

export const userRouter = asyncifyRouter();

userRouter.use((req, res, next) => {
  const sessionToken = req.cookies?.session_token;
  if (sessionToken && !req.headers.authorization) {
    req.headers.authorization = `Bearer ${sessionToken}`;
  }
  next();
});

const userController = new UserController();
userRouter.all("/users", verifyToken);
userRouter.post("/users", userController.create.bind(userController));
userRouter.put("/users", userController.merge.bind(userController));
// userRouter.get("/users", userController.getAll.bind(userController));
userRouter.get("/users/:id", userController.getOne.bind(userController));
userRouter.post(
  "/create_link",
  verifyToken,
  userController.createUserLink.bind(userController)
);
userRouter.get("/user_state", userController.getUserLink.bind(userController));
userRouter.post(
  "/user_state",
  userController.updateUserLink.bind(userController)
);
