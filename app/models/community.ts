import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import Profile from './profile.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Auction from './auction.js'

export default class Community extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare communityName: string

  @column()
  declare thumbnail: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare profileId: number

  @belongsTo(() => Profile)
  declare profile: BelongsTo<typeof Profile>

  @hasMany(() => Auction)
  declare auctions: HasMany<typeof Auction>
}
