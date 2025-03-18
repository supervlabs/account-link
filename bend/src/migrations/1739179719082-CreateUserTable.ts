import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateUserTable1739179719082 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "iss",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "sub",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "name",
            type: "varchar",
          },
          {
            name: "email",
            type: "varchar",
            isUnique: true,
          },
          {
            name: "role",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "linked_users",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true
    );
    await queryRunner.createIndex(
      "users",
      new TableIndex({
        name: "IDX_USER_CREDENTIALS",
        columnNames: ["iss", "sub"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex("users", "IDX_USER_CREDENTIALS");
    await queryRunner.dropTable("users");
  }
}
