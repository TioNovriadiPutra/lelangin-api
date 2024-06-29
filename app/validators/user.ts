import vine from '@vinejs/vine'

export const updateUserProfileValidator = vine.compile(
  vine.object({
    profilePic: vine
      .file({
        extnames: ['jpg', 'png', 'jpeg', 'JPG', 'PNG', 'JPEG'],
        size: '100mb',
      })
      .optional(),
    fullName: vine.string(),
  })
)

export const updateUserAddressValidator = vine.compile(
  vine.object({
    address: vine.string(),
  })
)
