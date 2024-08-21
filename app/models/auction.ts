import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import Category from './category.js'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import Community from './community.js'
import Profile from './profile.js'
import AuctionBet from './auction_bet.js'
import AuctionGallery from './auction_gallery.js'
import Transaction from './transaction.js'

export default class Auction extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare auctionName: string

  @column()
  declare description: string

  @column()
  declare startBid: number

  @column()
  declare buyNow: boolean

  @column()
  declare buyNowPrice?: number | null

  @column.dateTime()
  declare timer: DateTime

  @column()
  declare highestBid: number

  @column()
  declare approve: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare categoryId: number

  @column()
  declare communityId?: number | null

  @column()
  declare profileId: number

  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>

  @belongsTo(() => Community)
  declare community: BelongsTo<typeof Community>

  @belongsTo(() => Profile)
  declare profile: BelongsTo<typeof Profile>

  @hasMany(() => AuctionBet)
  declare bets: HasMany<typeof AuctionBet>

  @hasMany(() => AuctionGallery)
  declare auctionGalleries: HasMany<typeof AuctionGallery>

  @hasOne(() => Transaction)
  declare transaction: HasOne<typeof Transaction>
}
