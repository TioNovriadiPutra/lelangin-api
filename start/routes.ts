/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

router.get('/', async () => {
  return {
    message: 'API Running!',
  }
})

router
  .group(() => {
    // Auth Services
    router
      .group(() => {
        router.post('/login', '#controllers/auth_controller.login')
        router.post('/register', '#controllers/auth_controller.register')
        router.get('/logout', '#controllers/auth_controller.logout').use(
          middleware.auth({
            guards: ['api'],
          })
        )
      })
      .prefix('/auth')

    // User Services
    router
      .group(() => {
        router.get('/', '#controllers/users_controller.getUserProfile')
        router.put('/profile', '#controllers/users_controller.updateUserProfile')
        router.put('/address', '#controllers/users_controller.updateUserAddress')
      })
      .prefix('/user')
      .use(
        middleware.auth({
          guards: ['api'],
        })
      )

    // Category Services
    router
      .group(() => {
        router.get('/', '#controllers/categories_controller.getCategories')
      })
      .prefix('/category')
      .use(
        middleware.auth({
          guards: ['api'],
        })
      )

    // Community Services
    router
      .group(() => {
        router.get('/', '#controllers/communities_controller.getCommunities')
        router.post('/', '#controllers/communities_controller.addCommunity')
      })
      .prefix('/community')
      .use(
        middleware.auth({
          guards: ['api'],
        })
      )

    // Auction Services
    router
      .group(() => {
        router.get('/category', '#controllers/auctions_controller.getAuctionsByCategory')
        router.get('/community', '#controllers/auctions_controller.getAuctionsByCommunity')
        router.get('/:id', '#controllers/auctions_controller.getAuctionDetail')
        router.post('/', '#controllers/auctions_controller.addAuction')
        router.post('/bid/:id', '#controllers/auctions_controller.bidAuction')
      })
      .prefix('/auction')
      .use(
        middleware.auth({
          guards: ['api'],
        })
      )

    // Upload Services
    router
      .group(() => {
        router.get('/users/*', '#controllers/uploads_controller.getUserUpload')
        router.get('/communities/*', '#controllers/uploads_controller.getCommunityUpload')
        router.get('/auctions/*', '#controllers/uploads_controller.getAuctionUpload')
      })
      .prefix('/uploads')
  })
  .prefix('/lelangin/v1')
