import vine from '@vinejs/vine'

export const addAuctionValidator = vine.compile(
  vine.object({
    auctionName: vine.string(),
    categoryId: vine.number(),
    communityId: vine.number().optional(),
    description: vine.string(),
    startBid: vine.number().positive(),
    buyNow: vine.boolean(),
    buyNowPrice: vine.number().positive().optional(),
    timer: vine.date({
      formats: ['DD-MM-YYYY, HH:mm'],
    }),
    auctionImages: vine
      .array(
        vine.file({
          extnames: ['jpg', 'png', 'jpeg', 'JPG', 'PNG', 'JPEG'],
          size: '100mb',
        })
      )
      .minLength(1),
  })
)

export const bidAuctionValidator = vine.compile(
  vine.object({
    nominal: vine.number().positive(),
  })
)
