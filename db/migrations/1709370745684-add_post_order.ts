import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPostOrder1709370745684 implements MigrationInterface {
    name = 'AddPostOrder1709370745684'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shippings" RENAME COLUMN "phone" TO "phoneNumber"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "shippings" RENAME COLUMN "phoneNumber" TO "phone"`);
    }

}
