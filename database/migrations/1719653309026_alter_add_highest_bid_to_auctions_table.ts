import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'auctions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('highest_bid').notNullable().defaultTo(0)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('highest_bid')
    })
  }
}
