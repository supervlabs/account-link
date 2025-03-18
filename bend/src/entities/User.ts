import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export interface LinkedUser {
  domain: string;
  user: object;
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  iss: string; // id_token.iss: 'https://accounts.google.com'

  @Column({ nullable: true })
  sub: string; // id_token.sub

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  role: string;

  @Column({ type: "jsonb", nullable: true })
  linked_users?: LinkedUser[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  constructor(fields?: Partial<User>) {
    if (fields) {
      for (const key in fields) {
        if (fields.hasOwnProperty(key)) {
          (this as any)[key] = fields[key as keyof User];
        }
      }
    }
  }
}
