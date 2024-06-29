import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'community_followers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .integer('profile_id')
        .unsigned()
        .references('id')
        .inTable('profiles')
        .onDelete('CASCADE')
        .notNullable()
      table
        .integer('community_id')
        .unsigned()
        .references('id')
        .inTable('communities')
        .onDelete('CASCADE')
        .notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
