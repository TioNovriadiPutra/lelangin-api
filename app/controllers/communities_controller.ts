import ValidationException from '#exceptions/validation_exception'
import Community from '#models/community'
import Profile from '#models/profile'
import { addCommunityValidator } from '#validators/community'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'

export default class CommunitiesController {
  async getCommunities({ response }: HttpContext) {
    const communityData = await db.rawQuery(
      `SELECT
          id,
          community_name,
          thumbnail
         FROM communities`
    )

    return response.ok({
      message: 'Data fetched!',
      data: communityData[0],
    })
  }

  async addCommunity({ request, response, auth }: HttpContext) {
    try {
      const profileData = await Profile.findByOrFail('user_id', auth.user!.id)

      const data = await request.validateUsing(addCommunityValidator)

      const fileName = `${cuid()}.${data.thumbnail.extname}`

      const newCommunity = new Community()
      newCommunity.communityName = data.communityName
      newCommunity.thumbnail = fileName
      newCommunity.profileId = profileData.id

      await data.thumbnail.move(app.makePath('uploads/communities'), {
        name: fileName,
        overwrite: true,
      })

      await newCommunity.save()

      return response.created({
        message: 'Community created!',
      })
    } catch (error) {
      if (error.status === 422) {
        throw new ValidationException(error.messages)
      }
    }
  }
}
