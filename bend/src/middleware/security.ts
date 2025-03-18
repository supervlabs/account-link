import cors, { CorsOptions } from "cors";
import helmet from "helmet";
// import rateLimit from "express-rate-limit";
import { Express, NextFunction, Request, Response } from "express";
import os from "os";

export const setupSecurity = (
  app: Express,
  options?: { disableCorsPaths: string[] }
) => {
  const disableCorsPaths = options?.disableCorsPaths || [];
  let allowedOrigins = process.env.CORS_ORIGIN?.split(",") || [];
  allowedOrigins = allowedOrigins.filter((u) => !!u);
  allowedOrigins.push(`http://localhost:${process.env.BACKEND_PORT || 3030}`);
  allowedOrigins.push(
    `http://${os.hostname()}:${process.env.BACKEND_PORT || 3030}`
  );
  if (process.env.NEXT_PUBLIC_FRONTEND_URL) {
    allowedOrigins.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}`);
  }
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    allowedOrigins.push(`${process.env.NEXT_PUBLIC_BACKEND_URL}`);
  }
  allowedOrigins = [...new Set(allowedOrigins)];
  const corsOptions: CorsOptions = {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("not_allowed_by_cors"));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  };
  const optionalCors = (req: Request, res: Response, next: NextFunction) => {
    if (disableCorsPaths.includes(req.path)) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
      res.header("Access-Control-Allow-Headers", "*");
      return next();
    }
    cors(corsOptions)(req, res, next);
  };
  app.use(optionalCors);
  // app.use(cors(corsOptions));

  // Helmet 보안 헤더 설정
  app.use(helmet());

  // for X-Forwarded-Proto, X-Forwarded-For, X-Forwarded-Host
  // proxy에서 제공받는 위 정보를 신뢰하도록 설정
  app.set("trust proxy", true);

  // // Rate Limiting 설정
  // const limiter = rateLimit({
  //   windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) * 60 * 1000,
  //   max: Number(process.env.RATE_LIMIT_MAX_REQUESTS),
  //   message: "Too many requests from this IP, please try again later.",
  // });
  // app.use(limiter);
};
