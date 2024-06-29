import DataNotFoundException from '#exceptions/data_not_found_exception'
import ValidationException from '#exceptions/validation_exception'
import Auction from '#models/auction'
import AuctionGallery from '#models/auction_gallery'
import Category from '#models/category'
import Community from '#models/community'
import Profile from '#models/profile'
import { addAuctionValidator } from '#validators/auction'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class AuctionsController {
  async getAuctionsByCommunity({ response, params }: HttpContext) {
    let query = `SELECT
      a.id,
      a.auction_name,
      a.timer,
      a.highest_bid,
      GROUP_CONCAT(
        ag.auction_image
      ) AS galleries
    FROM auctions a
    JOIN auction_galleries ag ON a.id = ag.auction_id`

    if (params.id) {
      query += ` WHERE a.community_id = ${params.id}`
    }

    let auctionData = await db.rawQuery(query)

    if (auctionData[0][0].id !== null) {
      for (const data of auctionData[0]) {
        Object.assign(data, {
          galleries: data.galleries.split(','),
        })
      }
    }

    return response.ok({
      message: 'Data fetched!',
      data: auctionData[0][0].id === null ? [] : auctionData[0],
    })
  }

  async getAuctionsByCategory({ response, params }: HttpContext) {
    let query = `SELECT
      a.id,
      a.auction_name,
      a.timer,
      a.highest_bid,
      GROUP_CONCAT(
        ag.auction_image
      ) AS galleries
    FROM auctions a
    JOIN auction_galleries ag ON a.id = ag.auction_id`

    if (params.id) {
      query += ` WHERE a.category_id = ${params.id}`
    }

    let auctionData = await db.rawQuery(query)

    if (auctionData[0][0].id !== null) {
      for (const data of auctionData[0]) {
        Object.assign(data, {
          galleries: data.galleries.split(','),
        })
      }
    }

    return response.ok({
      message: 'Data fetched!',
      data: auctionData[0][0].id === null ? [] : auctionData[0],
    })
  }

  async addAuction({ request, response, auth }: HttpContext) {
    let categoryData: Category | null = null
    let communityData: Community | null = null

    try {
      const profileData = await Profile.findByOrFail('user_id', auth.user!.id)

      const data = await request.validateUsing(addAuctionValidator)

      categoryData = await Category.findOrFail(data.categoryId)

      if (data.communityId) {
        communityData = await Community.findOrFail(data.communityId)
      }

      const newAuction = new Auction()
      newAuction.auctionName = data.auctionName
      newAuction.description = data.description
      newAuction.startBid = data.startBid
      newAuction.buyNow = data.buyNow
      newAuction.buyNowPrice = data.buyNowPrice
      newAuction.timer = DateTime.fromJSDate(data.timer)
      newAuction.categoryId = categoryData.id
      newAuction.profileId = profileData.id

      if (data.communityId) {
        newAuction.communityId = communityData!.id
      }

      for (const image of data.auctionImages) {
        const fileName = `${cuid()}.${image.extname}`

        const newAuctionGallery = new AuctionGallery()
        newAuctionGallery.auctionImage = fileName

        await image.move(app.makePath('uploads/auctions'), {
          name: fileName,
          overwrite: true,
        })

        await newAuction.related('auctionGalleries').save(newAuctionGallery)
      }

      return response.created({
        message: 'Auction added!',
      })
    } catch (error) {
      if (error.status === 422) {
        throw new ValidationException(error.messages)
      } else if (error.status === 404) {
        throw new DataNotFoundException(categoryData === null ? 'Category' : 'Community')
      }
    }
  }
}
