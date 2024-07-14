import BadRequestException from '#exceptions/bad_request_exception'
import ValidationException from '#exceptions/validation_exception'
import Profile from '#models/profile'
import User from '#models/user'
import { loginValidator, registerValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import { Gender } from '../enums/gender.js'
import { DateTime } from 'luxon'

export default class AuthController {
  async login({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(loginValidator)

      const userData = await User.verifyCredentials(data.email, data.password)

      const profileData = await Profile.findByOrFail('user_id', userData.id)

      const token = await User.accessTokens.create(userData)

      return response.ok({
        message: 'Login success!',
        token,
        userId: profileData.id,
      })
    } catch (error) {
      if (error.status === 422) {
        throw new ValidationException(error.messages)
      } else if (error.status === 400) {
        throw new BadRequestException('Email or Password incorrect!')
      }
    }
  }

  async register({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(registerValidator)

      const newUser = new User()
      newUser.email = data.email
      newUser.password = data.password

      const newProfile = new Profile()
      newProfile.fullName = data.fullName
      newProfile.gender = data.gender as Gender
      newProfile.dob = DateTime.fromJSDate(data.dob)
      newProfile.address = data.address

      await newUser.related('profile').save(newProfile)

      return response.created({
        message: 'Registration success!',
      })
    } catch (error) {
      if (error.status === 422) {
        throw new ValidationException(error.messages)
      }
    }
  }

  async logout({ response, auth }: HttpContext) {
    const userData = await User.findOrFail(auth.user!.id)

    const tokenData = await User.accessTokens.all(userData)

    for (const token of tokenData) {
      await User.accessTokens.delete(userData, token.identifier)
    }

    return response.ok({
      message: 'Logout success!',
    })
  }
}
