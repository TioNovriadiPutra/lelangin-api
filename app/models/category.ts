import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import Auction from './auction.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class Category extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare categoryName: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @hasMany(() => Auction)
  declare auctions: HasMany<typeof Auction>
}
