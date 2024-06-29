import vine from '@vinejs/vine'
import { uniqueRule } from '../helpers/validator.js'

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string(),
    password: vine.string(),
  })
)

export const registerValidator = vine.compile(
  vine.object({
    email: vine
      .string()
      .email({
        ignore_max_length: true,
      })
      .use(uniqueRule({ table: 'users', column: 'email' })),
    password: vine.string().minLength(8).confirmed(),
    fullName: vine.string(),
    gender: vine.enum(['male', 'female']),
    dob: vine.date({
      formats: ['DD-MM-YYYY'],
    }),
    address: vine.string(),
  })
)
