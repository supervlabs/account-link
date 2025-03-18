import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import { getDomain } from "../utils/req";

export class UserController {
  private userService;
  constructor() {
    this.userService = new UserService();
  }

  async getAll(req: Request, res: Response) {
    try {
      const users = await this.userService.findAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "error_fetching_users" });
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const user = await this.userService.findOne(id);
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: "user_not_found" });
      }
    } catch (error) {
      res.status(500).json({ error: "error_fetching_user" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: `user_not_authenticated` });
        return;
      }
      const user = await this.userService.create(req.user);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "error_creating_user" });
      }
    }
  }

  async merge(req: Request, res: Response) {
    try {
      if (!req.user) {
        throw new Error("user_not_authenticated");
      }
      console.log(req.body);
      const userData = {
        ...req.user,
        ...req.body,
      };
      delete userData.id;
      delete userData.sub;
      delete userData.iss;
      console.log("merge", userData);
      const user = await this.userService.merge(req.user, userData);
      res.status(200).json(user);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "error_merge_user" });
      }
    }
  }

  async createUserLink(req: Request, res: Response) {
    try {
      const { user_link_uri, redirect_uri } = req.body;
      // console.log(req.body);
      if (!req.user) throw new Error("user_not_authenticated");
      if (!user_link_uri) throw new Error("user_link_path_not_set");
      if (!redirect_uri) throw new Error("redirect_uri_not_set");
      const stateKey = await this.userService.createUserLink(req.user);

      if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
        throw new Error("backend_url_not_configured");
      }

      const state_uri = new URL(
        "/user_state",
        process.env.NEXT_PUBLIC_BACKEND_URL
      );
      state_uri.searchParams.append("state", stateKey);
      const link_url = new URL(user_link_uri);
      link_url.searchParams.append("state_uri", state_uri.toString());
      link_url.searchParams.append("redirect_uri", redirect_uri);
      console.log(link_url.toString());
      res.status(200).json({
        user_link: link_url.toString(),
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "error_merge_user" });
      }
    }
  }

  async getUserLink(req: Request, res: Response) {
    try {
      const stateKey = req.query.state;
      if (!stateKey || typeof stateKey !== "string") {
        throw new Error("invalid_state_parameter");
      }
      const user = await this.userService.getUserLink(stateKey);
      res.status(200).json(user);
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "error_merge_user" });
      }
    }
  }

  async updateUserLink(req: Request, res: Response) {
    try {
      const stateKey = req.query.state;
      const linked_user = req.body;
      if (!stateKey || typeof stateKey !== "string") {
        throw new Error("invalid_state_parameter");
      }
      if (!linked_user) {
        throw new Error("linked_user_data_not_configured");
      }
      const domain = getDomain(req);
      // const host = req.get("host");
      // const host = req.get("X-Forwarded-Host") || req.get("host");
      // const protocol = req.get("X-Forwarded-Proto") || req.protocol;
      // const origin = `${protocol}://${host}`;
      if (!domain) {
        throw new Error("unable_to_extract_domain");
      }
      const user = await this.userService.updateUserLink(
        stateKey,
        domain,
        linked_user
      );
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "error_merge_user" });
      }
    }
  }
}
