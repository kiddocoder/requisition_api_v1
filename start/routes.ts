/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import ArticleCategoriesController from '#controllers/article_categories_controller'
import ArticlesController from '#controllers/articles_controller'
import CaissesController from '#controllers/caisses_controller'
import CarsController from '#controllers/cars_controller'
import DocumentController from '#controllers/documents_controller'
import EnterprisesController from '#controllers/enterprises_controller'
import EquipmentController from '#controllers/equipment_controller'
import RequisitionsController from '#controllers/requisitions_controller'
import StocksController from '#controllers/stocks_controller'
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
router.get('/requisition/articles/:requisition_id',RequisitionsController.prototype.requisition_articles)
router.post('/requisition/approve/direction/:requisition_id',RequisitionsController.prototype.approvDirection)

router.resource('/documents',DocumentController).apiOnly();
router.resource('/equipment',EquipmentController).apiOnly();

router.get('/car/documents/:id',CarsController.prototype.getCarDocuments);
router.get('/car/equipments/:id',CarsController.prototype.getCarEquipments);

router.post('/car/documents/:id',DocumentController.prototype.addCarDocuments);
router.post('/car/equipments/:id',EquipmentController.prototype.addCarEquipments);

router.resource('article_categories', ArticleCategoriesController).apiOnly();
router.resource('stocks',StocksController).apiOnly();

}).prefix('/api');

router.get('/attachments/:filename', RequisitionsController.prototype.serveAttachment);