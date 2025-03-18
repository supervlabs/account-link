import { Repository } from "typeorm";
import { appDataSource } from "../data-source";
import { LinkedUser, User } from "../entities/User";
import { JwtPayloadX } from "../utils/jwt";
import { getUserState, storeUserState } from "../utils/redis";

export class UserService {
  userRepository: Repository<User>;
  constructor() {
    this.userRepository = appDataSource.getRepository(User);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async create(userData: Partial<User> | Partial<JwtPayloadX>) {
    if (!userData.name) {
      throw new Error("user_name_not_found");
    }
    if (userData instanceof User || (userData.sub && userData.iss)) {
      const user = this.userRepository.create(userData);
      return await this.userRepository.save(user);
    }
    const jwt = userData as Partial<JwtPayloadX>;
    if (jwt.iss && jwt.sub) {
      const user = this.userRepository.create({
        iss: jwt.iss,
        sub: jwt.sub,
        id: jwt.id,
        email: jwt.email,
        name: jwt.name,
      });
      return await this.userRepository.save(user);
    }
  }

  async merge(
    userIdentifier: { id: number } | { iss: string; sub: string },
    userData: Partial<User> | Partial<JwtPayloadX>
  ) {
    let entity: User | null;
    let linkedUsers: LinkedUser[] = [];
    console.log("userIdentifier", userIdentifier);
    if ("id" in userIdentifier && userIdentifier.id) {
      entity = await this.userRepository.findOne({
        where: { id: userIdentifier.id },
      });
      if (!entity) {
        throw new Error("user_not_found");
      }
      linkedUsers = entity.linked_users || [];
      entity = this.userRepository.merge(entity, userData);
    } else if ("iss" in userIdentifier && "sub" in userIdentifier) {
      entity = await this.userRepository
        .findOne({
          where: {
            iss: userIdentifier.iss,
            sub: userIdentifier.sub,
          },
        })
        .catch(() => null);
      const { iss, sub } = userIdentifier;
      const { email, name } = userData as Partial<JwtPayloadX>;
      console.log("userData!", userData);
      if (!entity) {
        entity = new User();
      }
      linkedUsers = entity.linked_users || [];
      entity = this.userRepository.merge(entity, {
        iss,
        sub,
        email,
        name,
      });
    } else {
      throw new Error("invalid_user_identifier");
    }
    console.log("userData", userData);
    if (Array.isArray(userData.linked_users)) {
      for (const linked_user of userData.linked_users as LinkedUser[]) {
        let i = 0;
        for (; i < linkedUsers.length; i++) {
          if (linkedUsers[i].domain === linked_user.domain) {
            linkedUsers[i].user = linked_user.user;
            break;
          }
        }
        if (i >= linkedUsers.length) {
          linkedUsers.push({
            domain: linked_user.domain,
            user: linked_user.user,
          });
        }
      }
      entity.linked_users = linkedUsers;
    }
    return await this.userRepository.save(entity);
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, userData);
    return this.userRepository.findOneBy({ id });
  }

  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async createUserLink(user: JwtPayloadX) {
    const entity = await this.userRepository.findOne({
      where: {
        iss: user.iss,
        sub: user.sub,
      },
    });
    if (!entity) {
      throw new Error("user_not_found");
    }
    const stateKey = await storeUserState({
      id: user.id,
      name: user.name,
      email: user.email,
    });
    return stateKey;
  }

  async getUserLink(stateKey: string) {
    return await getUserState(stateKey);
  }

  async updateUserLink(stateKey: string, domain: string, linkedData: any) {
    const state = await getUserState(stateKey);
    if (!state) {
      throw new Error("state_not_found");
    }
    console.log(stateKey, domain, linkedData);
    const entity = await this.userRepository.findOne({
      where: {
        id: state.id,
      },
    });
    if (!entity) {
      throw new Error("invalid_user_in_state");
    }
    const linkedUsers = entity.linked_users || [];
    let i = 0;
    for (; i < linkedUsers.length; i++) {
      if (linkedUsers[i].domain === domain) {
        linkedUsers[i].user = linkedData;
        break;
      }
    }
    if (i >= linkedUsers.length) {
      linkedUsers.push({
        domain,
        user: linkedData,
      });
    }
    entity.linked_users = linkedUsers;
    return await this.userRepository.save(entity);
  }
}
