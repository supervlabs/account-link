import "reflect-metadata";
import express, { Express } from "express";
import morgan from "morgan";
import { setupSecurity } from "./middleware/security";
import { appDataSource } from "./data-source";
import { userRouter } from "./routes/users";
import { DataSource } from "typeorm";
import { rootRouter } from "./routes/root";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth";
import { setupReply } from "./middleware/reply";

export const app: Express = express();
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

setupSecurity(app, { disableCorsPaths: ["/user_state"] });
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10kb" }));
app.use(setupReply);
app.use("/", rootRouter);
app.use("/", userRouter);
app.use("/", authRouter);
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message });
  }
);

const BACKEND_PORT = process.env.BACKEND_PORT || 3030;
console.log("process.env.BACKEND_PORT", process.env.BACKEND_PORT);
export const run = async (params?: {
  dataSource?: DataSource;
  port?: number;
}) => {
  const { dataSource = appDataSource, port = BACKEND_PORT } = params || {};
  const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });

  await dataSource.initialize();
  console.log("Database connected");

  const shutdown = async () => {
    return new Promise<void>((resolve) => {
      server.close(async () => {
        await dataSource.destroy();
        resolve();
      });
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  return { server, dataSource, shutdown };
};

if (require.main === module) {
  run();
}
export default app;
