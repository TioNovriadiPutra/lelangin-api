import BadRequestException from '#exceptions/bad_request_exception'
import DataNotFoundException from '#exceptions/data_not_found_exception'
import ValidationException from '#exceptions/validation_exception'
import Auction from '#models/auction'
import AuctionGallery from '#models/auction_gallery'
import Category from '#models/category'
import Community from '#models/community'
import Profile from '#models/profile'
import { addAuctionValidator, bidAuctionValidator } from '#validators/auction'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { currencyFormatter } from '../helpers/formatter.js'
import AuctionBet from '#models/auction_bet'

export default class AuctionsController {
  async getUserAuctions({ response, auth }: HttpContext) {
    try {
      const profileData = await Profile.findByOrFail('user_id', auth.user!.id)

      const auctionData = await db.rawQuery(
        `SELECT
          a.id,
          a.auction_name,
          a.timer,
          a.highest_bid,
          GROUP_CONCAT(
            ag.auction_image
          ) AS galleries
         FROM auctions a
         JOIN auction_galleries ag ON a.id = ag.auction_id
         WHERE a.profile_id = ?`,
        [profileData.id]
      )

      return response.ok({
        message: 'Data fetched!',
        data: auctionData[0],
      })
    } catch (error) {
      if (error.status === 404) {
        throw new DataNotFoundException('Account')
      }
    }
  }

  async getUserBids({ response, auth }: HttpContext) {
    try {
      const profileData = await Profile.findByOrFail('user_id', auth.user!.id)

      const bidData = await db.rawQuery(
        `SELECT
          a.id,
          a.auction_name,
          a.timer,
          a.highest_bid,
          GROUP_CONCAT(
            ag.auction_image
          ) AS galleries
         FROM auction_bets ab
         JOIN auctions a ON ab.auction_id = a.id
         JOIN auction_galleries ag ON a.id = ag.auction_id
         WHERE ab.profile_id = ?
         GROUP BY ab.id`,
        [profileData.id]
      )

      return response.ok({
        message: 'Data fetched!',
        data: bidData[0],
      })
    } catch (error) {
      if (error.status === 404) {
        throw new DataNotFoundException('Account')
      } else {
        console.log(error)
      }
    }
  }

  async getAuctionsByCommunity({ request, response }: HttpContext) {
    const queryParam = request.qs()

    let query = `SELECT
      a.id,
      a.auction_name,
      a.timer,
      a.highest_bid,
      GROUP_CONCAT(
        ag.auction_image
      ) AS galleries
    FROM auctions a
    JOIN communities c ON a.community_id = c.id
    JOIN auction_galleries ag ON a.id = ag.auction_id`
    const paramArr = []

    if (queryParam.community) {
      query += ` WHERE c.community_name LIKE ?`
      paramArr.push(`%${queryParam.community}%`)
    }

    query += ` GROUP BY a.auction_name`

    let auctionData = await db.rawQuery(query, paramArr)

    for (const data of auctionData[0]) {
      Object.assign(data, {
        galleries: data.galleries.split(','),
      })
    }

    return response.ok({
      message: 'Data fetched!',
      data: auctionData[0],
    })
  }

  async getAuctionsByCategory({ request, response }: HttpContext) {
    const queryParam = request.qs()

    let query = `SELECT
      a.id,
      a.auction_name,
      a.timer,
      a.highest_bid,
      GROUP_CONCAT(
        ag.auction_image
      ) AS galleries
    FROM auctions a
    JOIN categories c ON a.category_id = c.id
    JOIN auction_galleries ag ON a.id = ag.auction_id`
    const paramArr = []

    if (queryParam.category) {
      query += ` WHERE c.category_name LIKE ?`
      paramArr.push(`%${queryParam.category}%`)
    }

    query += ` GROUP BY a.auction_name`

    let auctionData = await db.rawQuery(query, paramArr)

    for (const data of auctionData[0]) {
      Object.assign(data, {
        galleries: data.galleries.split(','),
      })
    }

    return response.ok({
      message: 'Data fetched!',
      data: auctionData[0],
    })
  }

  async getAuctionDetail({ response, params }: HttpContext) {
    try {
      const auctionData = await db.rawQuery(
        `SELECT
          a.id,
          a.auction_name,
          c.category_name,
          a.buy_now_price,
          a.timer,
          a.highest_bid,
          a.description,
          a.profile_id,
          GROUP_CONCAT(
            ag.auction_image
          ) AS galleries
         FROM auctions a
         JOIN categories c ON a.category_id = c.id
         JOIN auction_galleries ag ON a.id = ag.auction_id
         WHERE a.id = ?`,
        [params.id]
      )

      if (auctionData[0][0].id !== null) {
        for (const data of auctionData[0]) {
          Object.assign(data, {
            galleries: data.galleries.split(','),
          })
        }
      } else {
        throw new DataNotFoundException('Auction')
      }

      return response.ok({
        message: 'Data fetched!',
        data: auctionData[0][0],
      })
    } catch (error) {
      throw error
    }
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

  async bidAuction({ request, response, params, auth }: HttpContext) {
    try {
      const auctionData = await Auction.findOrFail(params.id)
      const profileData = await Profile.findByOrFail('user_id', auth.user!.id)

      const data = await request.validateUsing(bidAuctionValidator)

      if (data.nominal < auctionData.startBid) {
        throw new BadRequestException(
          `Nominal must be higher than ${currencyFormatter(auctionData.startBid)}`
        )
      } else if (data.nominal <= auctionData.highestBid) {
        throw new BadRequestException(
          `Nominal must be higher than ${currencyFormatter(auctionData.highestBid)}`
        )
      }

      const newAuctionBid = new AuctionBet()
      newAuctionBid.nominal = data.nominal
      newAuctionBid.profileId = profileData.id
      newAuctionBid.auctionId = auctionData.id

      auctionData.highestBid = data.nominal

      await newAuctionBid.save()
      await auctionData.save()

      return response.created({
        message: 'Bid Added!',
      })
    } catch (error) {
      if (error.status === 422) {
        throw new ValidationException(error.messages)
      } else if (error.status === 404) {
        throw new DataNotFoundException('Auction')
      } else {
        throw error
      }
    }
  }

  async approveBid({ response, params }: HttpContext) {
    try {
      const auctionData = await Auction.findOrFail(params.id)

      const auctionBidData = await AuctionBet.query()
        .whereHas('auction', (auctionQuery) => {
          auctionQuery.where('id', auctionData.id)
        })
        .orderBy('created_at', 'desc')
        .firstOrFail()

      auctionData.timer = DateTime.now().minus({ days: 1 })
      auctionBidData.approve = true

      await auctionData.save()
      await auctionBidData.save()

      return response.ok({
        message: 'Bid approved!',
      })
    } catch (error) {
      if (error.status === 404) {
        throw new DataNotFoundException('Bid')
      } else {
        console.log(error)
      }
    }
  }
}
