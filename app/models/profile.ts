import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import { Gender } from '../enums/gender.js'
import User from './user.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Community from './community.js'
import Auction from './auction.js'
import AuctionBet from './auction_bet.js'

export default class Profile extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string

  @column()
  declare gender: Gender

  @column.date()
  declare dob: DateTime

  @column()
  declare address: string

  @column()
  declare profilePic?: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare userId: number

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => Community)
  declare communities: HasMany<typeof Community>

  @hasMany(() => Auction)
  declare auctions: HasMany<typeof Auction>

  @hasMany(() => AuctionBet)
  declare bets: HasMany<typeof AuctionBet>
}
