import "reflect-metadata";
import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
  Express,
} from "express";

export type AsyncRequestHandler =
  | RequestHandler
  | ((req: Request, res: Response, next: NextFunction) => Promise<any> | any);

const asyncHandler = (handler: AsyncRequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await handler(req, res, next);
      if (res.headersSent) return;
      if (result === undefined) return;
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
};

export function asyncify(router: Router): Router {
  const methods = ["get", "post", "put", "delete", "patch"] as const;

  methods.forEach((method) => {
    const original = (router as any)[method].bind(router);
    (router as any)[method] = function (
      path: string | RegExp,
      ...handlers: AsyncRequestHandler[]
    ) {
      const wrappedHandlers = handlers.map((handler) => asyncHandler(handler));
      return original(path, ...wrappedHandlers);
    };
  });
  return router;
}

export function asyncifyRouter(): Router {
  const router = Router();
  return asyncify(router);
}
