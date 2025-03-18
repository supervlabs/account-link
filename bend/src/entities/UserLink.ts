import { createHash, UUID } from "crypto";
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from "typeorm";

export function generateUserLinkId(prefix: string, id: number, domain: string) {
  const data = `${prefix}-${id}-${domain}`;

  // UUID 형식의 해시 생성
  const hash = createHash("sha256").update(data).digest("hex").substring(0, 32);

  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    hash.slice(12, 16),
    hash.slice(16, 20),
    hash.slice(20, 32),
  ].join("-") as UUID;
}

@Entity("user_links")
export class UserLink {
  @PrimaryColumn()
  link_id: UUID;

  @Column()
  user_id: number;

  @Column()
  domain: string;

  @Column({ type: "jsonb", nullable: true })
  data?: object;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  constructor(fields?: Partial<UserLink>) {
    if (fields) {
      for (const key in fields) {
        if (fields.hasOwnProperty(key)) {
          (this as any)[key] = fields[key as keyof UserLink];
        }
      }
    }
  }

  generateUserLinkId(prefix: string, id: number, domain: string) {
    this.link_id = generateUserLinkId(prefix, id, domain);
    return this.link_id;
  }
}
