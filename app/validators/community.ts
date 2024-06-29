import vine from '@vinejs/vine'

export const addCommunityValidator = vine.compile(
  vine.object({
    thumbnail: vine.file({
      extnames: ['jpg', 'png', 'jpeg', 'JPG', 'PNG', 'JPEG'],
      size: '100mb',
    }),
    communityName: vine.string(),
  })
)
