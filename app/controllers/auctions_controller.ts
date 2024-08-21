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
import { AuctionStatus } from '../enums/status.js'
import Transaction from '#models/transaction'
import { shippingAuctionValidator } from '#validators/shipping_auction'

export default class AuctionsController {
  async getUserBids({ response, auth }: HttpContext) {
    try {
      const profileData = await Profile.findByOrFail('user_id', auth.user!.id)

      let bidData = await db.rawQuery(
        `SELECT
          a.id,
          a.auction_name,
          a.timer,
          a.highest_bid,
          a.approve,
                    CASE
            WHEN a.status = "progress" THEN "On Progress"
            WHEN a.status = "payment" THEN "Waiting for Payment"
            WHEN a.status = "shipping" THEN "Shipping"
            WHEN a.status = "done" THEN "Finish"
          END AS status,
          GROUP_CONCAT(
            ag.auction_image
          ) AS galleries
         FROM auction_bets ab
         JOIN auctions a ON ab.auction_id = a.id
         JOIN auction_galleries ag ON a.id = ag.auction_id
         WHERE ab.profile_id = ?
         GROUP BY ab.id, a.id, a.auction_name`,
        [profileData.id]
      )

      for (const data of bidData[0]) {
        Object.assign(data, {
          galleries: data.galleries.split(','),
        })
      }

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

  async getAuctionsByCommunity({ request, response, auth }: HttpContext) {
    const queryParam = request.qs()

    const profileData = await Profile.findByOrFail('user_id', auth.user!.id)

    let query = `SELECT
      a.id,
      a.auction_name,
      a.timer,
      a.highest_bid,
      a.approve,
                CASE
            WHEN a.status = "progress" THEN "On Progress"
            WHEN a.status = "payment" THEN "Waiting for Payment"
            WHEN a.status = "shipping" THEN "Shipping"
            WHEN a.status = "done" THEN "Finish"
          END AS status,
      GROUP_CONCAT(
        ag.auction_image
      ) AS galleries
    FROM auctions a
    JOIN communities c ON a.community_id = c.id
    JOIN auction_galleries ag ON a.id = ag.auction_id
    WHERE a.profile_id != ?`
    const paramArr = [profileData.id.toString()]

    if (queryParam.community) {
      query += ` AND a.community_id = ?`
      paramArr.push(queryParam.community)
    }

    query += ` GROUP BY a.id`

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

  async getAuctionsByCategory({ request, response, auth }: HttpContext) {
    const queryParam = request.qs()

    const profileData = await Profile.findByOrFail('user_id', auth.user!.id)

    let query = `SELECT
      a.id,
      a.auction_name,
      a.timer,
      a.highest_bid,
      a.approve,
          CASE
            WHEN a.status = "progress" THEN "On Progress"
            WHEN a.status = "payment" THEN "Waiting for Payment"
            WHEN a.status = "shipping" THEN "Shipping"
            WHEN a.status = "done" THEN "Finish"
          END AS status,
      GROUP_CONCAT(
        ag.auction_image
      ) AS galleries
    FROM auctions a
    JOIN categories c ON a.category_id = c.id
    JOIN auction_galleries ag ON a.id = ag.auction_id
    WHERE a.profile_id != ?`
    const paramArr = [profileData.id.toString()]

    if (queryParam.category) {
      query += ` AND a.category_id = ?`
      paramArr.push(queryParam.category)
    }

    query += ` GROUP BY a.id`

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

  async getUserAuctions({ response, auth }: HttpContext) {
    const profileData = await Profile.findByOrFail('user_id', auth.user!.id)

    const auctionData = await db.rawQuery(
      `SELECT
          a.id,
          a.auction_name,
          a.timer,
          a.highest_bid,
          a.approve,
          CASE
            WHEN a.status = "progress" THEN "On Progress"
            WHEN a.status = "payment" THEN "Waiting for Payment"
            WHEN a.status = "shipping" THEN "Shipping"
            WHEN a.status = "done" THEN "Finish"
          END AS status,
          GROUP_CONCAT(
            ag.auction_image
          ) AS galleries
         FROM auctions a
         JOIN categories c ON a.category_id = c.id
         JOIN auction_galleries ag ON a.id = ag.auction_id
         WHERE a.profile_id = ?
         GROUP BY a.id`,
      [profileData.id]
    )

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

  async getApproveAuctions({ response, auth }: HttpContext) {
    const profileData = await Profile.findByOrFail('user_id', auth.user!.id)

    let bidData = await db.rawQuery(
      `SELECT
          a.id,
          a.auction_name,
          a.timer,
          a.highest_bid,
          a.approve,
          CASE
            WHEN ab.status = "progress" THEN "On Progress"
            WHEN ab.status = "payment" THEN "Waiting for Payment"
            WHEN ab.status = "shipping" THEN "Shipping"
            WHEN ab.status = "done" THEN "Finish"
          END AS status,
          GROUP_CONCAT(
            ag.auction_image
          ) AS galleries
         FROM auction_bets ab
         JOIN auctions a ON ab.auction_id = a.id
         JOIN auction_galleries ag ON a.id = ag.auction_id
         WHERE ab.profile_id = ? AND ab.approve = 1
         GROUP BY ab.id, a.id, a.auction_name`,
      [profileData.id]
    )

    for (const data of bidData[0]) {
      Object.assign(data, {
        galleries: data.galleries.split(','),
      })
    }

    return response.ok({
      message: 'Data fetched!',
      data: bidData[0],
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
          a.approve,
          a.profile_id,
          CASE
            WHEN a.status = "progress" THEN "On Progress"
            WHEN a.status = "payment" THEN "Waiting for Payment"
            WHEN a.status = "shipping" THEN "Shipping"
            WHEN a.status = "done" THEN "Finish"
          END AS status,
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
      auctionData.approve = true
      auctionData.status = AuctionStatus['PAYMENT']
      auctionBidData.approve = true
      auctionBidData.status = AuctionStatus['PAYMENT']

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

  async buyNowAuction({ response, params, auth }: HttpContext) {
    try {
      const profileData = await Profile.findByOrFail('user_id', auth.user!.id)

      const auctionData = await Auction.findOrFail(params.id)

      const newAuctionBid = new AuctionBet()
      newAuctionBid.nominal = auctionData.buyNowPrice!
      newAuctionBid.profileId = profileData.id
      newAuctionBid.auctionId = auctionData.id
      newAuctionBid.approve = true
      newAuctionBid.status = AuctionStatus['PAYMENT']

      auctionData.timer = DateTime.now().minus({ days: 1 })
      auctionData.approve = true

      await auctionData.save()
      await newAuctionBid.save()

      return response.ok({
        message: 'Buy now approved!',
      })
    } catch (error) {
      if (error.status === 404) {
        throw new DataNotFoundException('Auction')
      }
    }
  }

  async paymentAuction({ response, params, auth }: HttpContext) {
    try {
      const profileData = await Profile.findByOrFail('user_id', auth.user!.id)

      const auctionData = await Auction.query()
        .preload('auctionGalleries')
        .where('id', params.id)
        .firstOrFail()

      const bidData = await AuctionBet.query()
        .where('auction_id', auctionData.id)
        .andWhere('profile_id', profileData.id)
        .orderBy('nominal', 'desc')
        .firstOrFail()

      const newTransaction = new Transaction()
      newTransaction.auctionName = auctionData.auctionName
      newTransaction.nominal = auctionData.highestBid
      newTransaction.thumbnail = auctionData.auctionGalleries[0].auctionImage
      newTransaction.profileId = profileData.id
      newTransaction.auctionId = auctionData.id

      bidData.status = AuctionStatus['SHIPPING']
      auctionData.status = AuctionStatus['SHIPPING']

      await newTransaction.save()
      await bidData.save()
      await auctionData.save()

      return response.created({
        message: 'Transaction success!',
      })
    } catch (error) {
      if (error.status === 404) {
        throw new DataNotFoundException('Auction')
      } else {
        console.log(error)
      }
    }
  }

  async shippingAuction({ request, response, params }: HttpContext) {
    try {
      const data = await request.validateUsing(shippingAuctionValidator)

      const auctionData = await Auction.findOrFail(params.id)
      const transactionData = await Transaction.findByOrFail('auction_id', auctionData.id)
      const bidData = await AuctionBet.query()
        .where('auction_id', params.id)
        .andWhere('approve', true)
        .firstOrFail()

      auctionData.status = AuctionStatus['DONE']
      transactionData.shippingCode = data.shippingCode
      bidData.status = AuctionStatus['DONE']

      await auctionData.save()
      await transactionData.save()
      await bidData.save()

      return response.ok({
        message: 'Shippment success!',
      })
    } catch (error) {
      if (error.status === 422) {
        throw new ValidationException(error.messages)
      } else if (error.status === 404) {
        throw new DataNotFoundException('Auction')
      } else {
        console.log(error)
      }
    }
  }
}
