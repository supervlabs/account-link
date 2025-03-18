import { Repository } from "typeorm";
import { appDataSource } from "../data-source";
import { generateUserLinkId, UserLink } from "../entities/UserLink";
import { UUID } from "crypto";

export class UserLinkService {
  userLinkRepository: Repository<UserLink>;

  constructor() {
    this.userLinkRepository = appDataSource.getRepository(UserLink);
  }

  /**
   * Find all user links
   */
  async findAll(): Promise<UserLink[]> {
    return this.userLinkRepository.find();
  }

  /**
   * Find user links by user ID
   */
  async findByUserId(userId: number): Promise<UserLink[]> {
    return this.userLinkRepository.find({
      where: { user_id: userId },
    });
  }

  /**
   * Find user links by domain
   */
  async findByDomain(domain: string): Promise<UserLink[]> {
    return this.userLinkRepository.find({
      where: { domain },
    });
  }

  /**
   * Find a specific user link by user ID and domain
   */
  async findOne(userId: number, domain: string): Promise<UserLink | null> {
    return this.userLinkRepository.findOne({
      where: { user_id: userId, domain },
    });
  }

  /**
   * Find a specific user link by link ID
   */
  async findById(linkId: UUID): Promise<UserLink | null> {
    return this.userLinkRepository.findOneBy({ link_id: linkId });
  }

  /**
   * Create a new user link
   */
  async create(
    prefix: string,
    userId: number,
    domain: string,
    data?: object
  ): Promise<UserLink> {
    // Generate a deterministic link ID
    const linkId = generateUserLinkId(prefix, userId, domain);

    // Check if link already exists
    const existingLink = await this.findById(linkId);
    if (existingLink) {
      throw new Error("link_already_exists");
    }

    // Create and save the new link
    const userLink = this.userLinkRepository.create({
      link_id: linkId,
      user_id: userId,
      domain,
      data,
    });

    return await this.userLinkRepository.save(userLink);
  }

  /**
   * Update an existing user link
   */
  async update(
    linkId: UUID,
    updateData: Partial<UserLink>
  ): Promise<UserLink | null> {
    const userLink = await this.findById(linkId);

    if (!userLink) {
      throw new Error("user_link_not_found");
    }

    // Remove fields that shouldn't be updated
    delete updateData.link_id;
    delete updateData.user_id;
    delete updateData.created_at;
    delete updateData.updated_at;

    await this.userLinkRepository.update(linkId, updateData);
    return this.findById(linkId);
  }

  /**
   * Merge data into an existing user link or create if it doesn't exist
   */
  async merge(
    prefix: string,
    userId: number,
    domain: string,
    data: object
  ): Promise<UserLink> {
    const linkId = generateUserLinkId(prefix, userId, domain);
    let userLink = await this.findById(linkId);

    if (!userLink) {
      // Create new link if it doesn't exist
      userLink = this.userLinkRepository.create({
        link_id: linkId,
        user_id: userId,
        domain,
        data,
      });
    } else {
      // Merge data with existing link
      const currentData = userLink.data || {};
      userLink.data = { ...currentData, ...data };
    }

    return await this.userLinkRepository.save(userLink);
  }

  /**
   * Delete a user link by ID
   */
  async delete(linkId: UUID): Promise<void> {
    await this.userLinkRepository.delete(linkId);
  }

  /**
   * Delete all links for a specific user
   */
  async deleteByUserId(userId: number): Promise<void> {
    await this.userLinkRepository.delete({ user_id: userId });
  }

  /**
   * Delete a specific user link by user ID and domain
   */
  async deleteByUserIdAndDomain(userId: number, domain: string): Promise<void> {
    const linkId = generateUserLinkId("link", userId, domain);
    await this.userLinkRepository.delete(linkId);
  }

  /**
   * Check if a user link exists
   */
  async exists(userId: number, domain: string): Promise<boolean> {
    const count = await this.userLinkRepository.count({
      where: { user_id: userId, domain },
    });
    return count > 0;
  }
}
