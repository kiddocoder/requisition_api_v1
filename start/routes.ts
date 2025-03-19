/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import EnterprisesController from '#controllers/enterprises_controller'
import UserAuthController from '#controllers/user_auth_controller'
import UsersController from '#controllers/users_controller'
import router from '@adonisjs/core/services/router'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.group(() => {

router.resource('users', UsersController).apiOnly()
router.post('/users/login',UserAuthController.prototype.login);
router.resource('enterprises', EnterprisesController).apiOnly();

}).prefix('/api');
