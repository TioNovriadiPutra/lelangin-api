import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'auction_bets'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .enum('status', ['progress', 'payment', 'shipping', 'done'])
        .notNullable()
        .defaultTo('progress')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('status')
    })
  }
}
