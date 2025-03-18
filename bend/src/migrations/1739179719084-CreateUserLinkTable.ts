import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateUserLinksTable1739179719084 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "user_links",
        columns: [
          {
            name: "link_id",
            type: "uuid",
            isPrimary: true,
          },
          {
            name: "user_id",
            type: "int",
          },
          {
            name: "domain",
            type: "varchar",
          },
          {
            name: "data",
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

    // Create indexes for better query performance
    await queryRunner.createIndex(
      "user_links",
      new TableIndex({
        name: "IDX_USER_LINKS_USER_ID",
        columnNames: ["user_id"],
      })
    );

    await queryRunner.createIndex(
      "user_links",
      new TableIndex({
        name: "IDX_USER_LINKS_DOMAIN",
        columnNames: ["domain"],
      })
    );

    // Create a composite index for queries that filter by both user_id and domain
    await queryRunner.createIndex(
      "user_links",
      new TableIndex({
        name: "IDX_USER_LINKS_USER_DOMAIN",
        columnNames: ["user_id", "domain"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex("user_links", "IDX_USER_LINKS_USER_DOMAIN");
    await queryRunner.dropIndex("user_links", "IDX_USER_LINKS_DOMAIN");
    await queryRunner.dropIndex("user_links", "IDX_USER_LINKS_USER_ID");
    await queryRunner.dropTable("user_links");
  }
}