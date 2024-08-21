import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Profile from './profile.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Auction from './auction.js'

export default class Transaction extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare auctionName: string

  @column()
  declare nominal: number

  @column()
  declare thumbnail: string

  @column()
  declare shippingCode: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare profileId: number

  @column()
  declare auctionId?: number

  @belongsTo(() => Profile)
  declare profile: BelongsTo<typeof Profile>

  @belongsTo(() => Auction)
  declare auction: BelongsTo<typeof Auction>
}
