import vine from '@vinejs/vine'

export const shippingAuctionValidator = vine.compile(
  vine.object({
    shippingCode: vine.string(),
  })
)
