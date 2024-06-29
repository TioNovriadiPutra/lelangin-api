import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Auction from './auction.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class AuctionGallery extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare auctionImage: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column()
  declare auctionId: number

  @belongsTo(() => Auction)
  declare auction: BelongsTo<typeof Auction>
}
