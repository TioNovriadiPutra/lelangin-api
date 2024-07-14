import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'auction_bets'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('approve').notNullable().defaultTo(false)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('approve')
    })
  }
}
