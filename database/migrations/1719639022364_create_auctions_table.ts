import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'auctions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('auction_name', 50).notNullable()
      table.text('description', 'longtext').notNullable()
      table.integer('start_bid').notNullable()
      table.boolean('buy_now').notNullable()
      table.integer('buy_now_price').nullable()
      table.timestamp('timer').notNullable()
      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').notNullable().defaultTo(this.now())
      table
        .integer('category_id')
        .unsigned()
        .references('id')
        .inTable('categories')
        .onDelete('CASCADE')
        .notNullable()
      table
        .integer('community_id')
        .unsigned()
        .references('id')
        .inTable('communities')
        .onDelete('SET NULL')
        .nullable()
      table
        .integer('profile_id')
        .unsigned()
        .references('id')
        .inTable('profiles')
        .onDelete('CASCADE')
        .notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
