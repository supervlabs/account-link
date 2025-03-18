import { asyncifyRouter } from "../utils/asyncify";
import { verifyToken } from "../middleware/auth";
import { UserLinkController } from "../controllers/UserLinkController";

export const userLinkRouter = asyncifyRouter();

// Add session token to authorization header if present in cookies
userLinkRouter.use((req, res, next) => {
  const sessionToken = req.cookies?.session_token;
  if (sessionToken && !req.headers.authorization) {
    req.headers.authorization = `Bearer ${sessionToken}`;
  }
  next();
});

const ctrl = new UserLinkController();
userLinkRouter.use("/user-links", verifyToken);
userLinkRouter.get("/user-links", ctrl.getAll.bind(ctrl));
userLinkRouter.get("/user-links/:domain", ctrl.getByDomain.bind(ctrl));
userLinkRouter.post("/user-links", ctrl.create.bind(ctrl));
userLinkRouter.put("/user-links/:domain", ctrl.update.bind(ctrl));
userLinkRouter.put("/user-links/merge", ctrl.merge.bind(ctrl));
userLinkRouter.delete("/user-links/:domain", ctrl.delete.bind(ctrl));
userLinkRouter.delete("/user-links", ctrl.deleteAll.bind(ctrl));
