import { Request, Response } from "express";
import { UserLinkService } from "../services/UserLinkService";

export class UserLinkController {
  private userLinkService: UserLinkService;
  private sitePrefix: string;

  constructor() {
    this.userLinkService = new UserLinkService();

    // Get site domain to use as prefix from environment variable
    this.sitePrefix = process.env.NEXT_PUBLIC_SITE_DOMAIN || "app";

    // Remove protocol and non-alphanumeric characters for cleaner prefix
    this.sitePrefix = this.sitePrefix.replace(/^https?:\/\//, "");
    this.sitePrefix = this.sitePrefix.replace(/[^a-zA-Z0-9]/g, "-");
  }

  /**
   * Helper function to send response with status code and data
   */
  private responseResult(res: Response, statusCode: number, data: any) {
    res.status(statusCode).json(data);
    return;
  }

  /**
   * Get all user links for the authenticated user
   */
  async getAll(req: Request, res: Response) {
    try {
      if (!req.user || !req.user.id) {
        return this.responseResult(res, 401, { error: "user_not_authenticated" });
      }

      const links = await this.userLinkService.findByUserId(req.user.id);
      this.responseResult(res, 200, links);
    } catch (error) {
      this.responseResult(res, 500, { error: "error_fetching_user_links" });
    }
  }

  /**
   * Get a specific domain link for the authenticated user
   */
  async getByDomain(req: Request, res: Response) {
    try {
      if (!req.user || !req.user.id) {
        return this.responseResult(res, 401, { error: "user_not_authenticated" });
      }

      const domain = req.params.domain;

      if (!domain) {
        return this.responseResult(res, 400, { error: "domain_required" });
      }

      const link = await this.userLinkService.findOne(req.user.id, domain);

      if (link) {
        this.responseResult(res, 200, link);
      } else {
        this.responseResult(res, 404, { error: "user_link_not_found" });
      }
    } catch (error) {
      this.responseResult(res, 500, { error: "error_fetching_user_link" });
    }
  }

  /**
   * Create a new user link for the authenticated user
   */
  async create(req: Request, res: Response) {
    try {
      if (!req.user || !req.user.id) {
        return this.responseResult(res, 401, { error: "user_not_authenticated" });
      }

      const { domain, data } = req.body;

      if (!domain || typeof domain !== "string") {
        return this.responseResult(res, 400, { error: "domain_required" });
      }

      const userLink = await this.userLinkService.create(
        this.sitePrefix,
        req.user.id,
        domain,
        data
      );

      this.responseResult(res, 201, userLink);
    } catch (error) {
      if (error instanceof Error) {
        this.responseResult(res, 500, { error: error.message });
      } else {
        this.responseResult(res, 500, { error: "error_creating_user_link" });
      }
    }
  }

  /**
   * Update a user link for the authenticated user by domain
   */
  async update(req: Request, res: Response) {
    try {
      if (!req.user || !req.user.id) {
        return this.responseResult(res, 401, { error: "user_not_authenticated" });
      }

      const domain = req.params.domain;

      if (!domain) {
        return this.responseResult(res, 400, { error: "domain_required" });
      }

      // Check if link exists
      const existingLink = await this.userLinkService.findOne(
        req.user.id,
        domain
      );

      if (!existingLink) {
        return this.responseResult(res, 404, { error: "user_link_not_found" });
      }

      const updateData = req.body;

      // Remove fields that shouldn't be updated through API
      delete updateData.link_id;
      delete updateData.user_id;
      delete updateData.domain;
      delete updateData.created_at;
      delete updateData.updated_at;

      const userLink = await this.userLinkService.update(
        existingLink.link_id,
        updateData
      );
      this.responseResult(res, 200, userLink);
    } catch (error) {
      if (error instanceof Error) {
        this.responseResult(res, 500, { error: error.message });
      } else {
        this.responseResult(res, 500, { error: "error_updating_user_link" });
      }
    }
  }

  /**
   * Merge data into a user link or create it if it doesn't exist
   */
  async merge(req: Request, res: Response) {
    try {
      if (!req.user || !req.user.id) {
        return this.responseResult(res, 401, { error: "user_not_authenticated" });
      }

      const { domain, data } = req.body;

      if (!domain || typeof domain !== "string") {
        return this.responseResult(res, 400, { error: "domain_required" });
      }

      if (!data || typeof data !== "object") {
        return this.responseResult(res, 400, { error: "data_object_required" });
      }

      const userLink = await this.userLinkService.merge(
        this.sitePrefix,
        req.user.id,
        domain,
        data
      );

      this.responseResult(res, 200, userLink);
    } catch (error) {
      if (error instanceof Error) {
        this.responseResult(res, 500, { error: error.message });
      } else {
        this.responseResult(res, 500, { error: "error_merging_user_link" });
      }
    }
  }

  /**
   * Delete a specific link for the authenticated user
   */
  async delete(req: Request, res: Response) {
    try {
      if (!req.user || !req.user.id) {
        return this.responseResult(res, 401, { error: "user_not_authenticated" });
      }

      const domain = req.params.domain;

      if (!domain) {
        return this.responseResult(res, 400, { error: "domain_required" });
      }

      await this.userLinkService.deleteByUserIdAndDomain(req.user.id, domain);
      this.responseResult(res, 204, null);
    } catch (error) {
      this.responseResult(res, 500, { error: "error_deleting_user_link" });
    }
  }

  /**
   * Delete all links for the authenticated user
   */
  async deleteAll(req: Request, res: Response) {
    try {
      if (!req.user || !req.user.id) {
        return this.responseResult(res, 401, { error: "user_not_authenticated" });
      }

      await this.userLinkService.deleteByUserId(req.user.id);
      this.responseResult(res, 204, null);
    } catch (error) {
      this.responseResult(res, 500, { error: "error_deleting_user_links" });
    }
  }
}