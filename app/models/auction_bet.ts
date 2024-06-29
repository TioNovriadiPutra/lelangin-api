import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Profile from './profile.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Auction from './auction.js'

export default class AuctionBet extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nominal: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column()
  declare profileId: number

  @column()
  declare auctionId: number

  @belongsTo(() => Profile)
  declare profile: BelongsTo<typeof Profile>

  @belongsTo(() => Auction)
  declare auction: BelongsTo<typeof Auction>
}
