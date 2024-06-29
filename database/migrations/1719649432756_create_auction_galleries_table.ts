import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'auction_galleries'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('auction_image', 255).notNullable()
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table
        .integer('auction_id')
        .unsigned()
        .references('id')
        .inTable('auctions')
        .onDelete('CASCADE')
        .notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
