/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import ArticlesController from '#controllers/articles_controller'
import CaissesController from '#controllers/caisses_controller'
import CarsController from '#controllers/cars_controller'
import EnterprisesController from '#controllers/enterprises_controller'
import RequisitionsController from '#controllers/requisitions_controller'
import SuppliersController from '#controllers/suppliers_controller'
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
router.resource('requisitions',RequisitionsController).apiOnly();
router.resource('articles',ArticlesController).apiOnly();
router.resource('suppliers',SuppliersController).apiOnly();
router.post("procurement",RequisitionsController.prototype.approvisionnement);
router.resource('cars',CarsController).apiOnly();
router.resource('caisses',CaissesController).apiOnly();
router.get('/requisition/comments/:requisition_id',RequisitionsController.prototype.requisitionComments)
router.post('/requisition/approve/compta/:requisition_id',RequisitionsController.prototype.ApproveCompta)

}).prefix('/api');

router.get('/attachments/:filename', RequisitionsController.prototype.serveAttachment);