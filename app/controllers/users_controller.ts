import DataNotFoundException from '#exceptions/data_not_found_exception'
import ValidationException from '#exceptions/validation_exception'
import Profile from '#models/profile'
import { updateUserAddressValidator, updateUserProfileValidator } from '#validators/user'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'

export default class UsersController {
  async getUserProfile({ response, auth }: HttpContext) {
    try {
      const userData = await db.rawQuery(
        `SELECT
          id,
          full_name,
          profile_pic,
          address
         FROM profiles
         WHERE user_id = ?`,
        [auth.user!.id]
      )

      if (userData[0].length === 0) {
        throw new DataNotFoundException('Account')
      }

      return response.ok({
        message: 'Data fetched!',
        data: userData[0][0],
      })
    } catch (error) {
      throw error
    }
  }

  async updateUserProfile({ request, response, auth }: HttpContext) {
    try {
      const profileData = await Profile.findByOrFail('user_id', auth.user!.id)

      const data = await request.validateUsing(updateUserProfileValidator)

      profileData.fullName = data.fullName

      if (data.profilePic) {
        const fileName = `${cuid()}.${data.profilePic.extname}`

        profileData.profilePic = fileName

        await data.profilePic.move(app.makePath('uploads/users'), {
          name: fileName,
          overwrite: true,
        })
      }

      await profileData.save()

      return response.ok({
        message: 'Account data updated!',
      })
    } catch (error) {
      if (error.status === 422) {
        throw new ValidationException(error.messages)
      } else if (error.status === 404) {
        throw new DataNotFoundException('Account')
      }
    }
  }

  async updateUserAddress({ request, response, auth }: HttpContext) {
    try {
      const profileData = await Profile.findByOrFail('user_id', auth.user!.id)

      const data = await request.validateUsing(updateUserAddressValidator)

      profileData.address = data.address

      await profileData.save()

      return response.ok({
        message: 'Account data updated!',
      })
    } catch (error) {
      if (error.status === 422) {
        throw new ValidationException(error.messages)
      } else if (error.status === 404) {
        throw new DataNotFoundException('Account')
      }
    }
  }
}
