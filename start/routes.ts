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
import BudgetsController from '#controllers/budgets_controller'
import CaissesController from '#controllers/caisses_controller'
import CarsController from '#controllers/cars_controller'
import DepartmentsController from '#controllers/departments_controller'
import DocumentController from '#controllers/documents_controller'
import EnterprisesController from '#controllers/enterprises_controller'
import EquipmentController from '#controllers/equipment_controller'
import NotificationsController from '#controllers/notifications_controller'
import OperationsController from '#controllers/operations_controller'
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
router.post('/super-admin/reset-password',UserAuthController.prototype.resetPassword);
router.get('/user/require-reset/:id',UserAuthController.prototype.requireReset);
router.delete("/user/definitly/:id",UsersController.prototype.deleteDefinitlyUser);

router.resource('enterprises', EnterprisesController).apiOnly();
router.resource('requisitions',RequisitionsController).apiOnly();
router.get('/enterprise/users/:enterprise_id',UsersController.prototype.getEntepriseUsers)

router.resource('articles',ArticlesController).apiOnly();
router.get('/category/articles/:id',ArticlesController.prototype.getCategoryArticles);
router.get('/suppliers/articles/:id',ArticlesController.prototype.getSupplierArticles);

router.resource('suppliers',SuppliersController).apiOnly();
router.post("procurement",RequisitionsController.prototype.approvisionnement);
router.resource('cars',CarsController).apiOnly();

router.resource('caisses',CaissesController).apiOnly();
router.get('/caisses/company/:id',CaissesController.prototype.getCaisseByEnterprise);
router.post('/caisses/alimentation/:id',CaissesController.prototype.alimentation);
router.get('/caisses/operations/:id',CaissesController.prototype.getCaisseOperations);
router.get('caisses/budgets/:id',CaissesController.prototype.getCaisseBudgets);

router.get('/requisition/comments/:requisition_id',RequisitionsController.prototype.requisitionComments)
router.post('/requisition/approve/compta/:requisition_id',RequisitionsController.prototype.ApproveCompta)
router.get('/requisition/articles/:requisition_id',RequisitionsController.prototype.requisition_articles)
router.post('/requisition/approve/direction/:requisition_id',RequisitionsController.prototype.approvDirection)
router.get('/demandeur/requisitions/:id',RequisitionsController.prototype.getRequisitionByDemandeur)
router.get('/enterprise/requisitions/:id',RequisitionsController.prototype.getRequisitionByEnterprise)
router.delete('/requisitions/items/article/:requisition_id/:item_id',RequisitionsController.prototype.deleteRequisisitionArticle)
router.get('/history/requisitions',RequisitionsController.prototype.getHistoryRequisitions)
router.get('/user/history/requisitions/:id',RequisitionsController.prototype.getUserRequesitionHistory)
router.get('/enterprise/history/requisitions/:id',RequisitionsController.prototype.getEnterpriseHistoryRequisitions)
router.get('/user/history/requisition/:id',RequisitionsController.prototype.getUserRequesitionHistory)
router.get('/user/getUserDraftRequisitions/:id',RequisitionsController.prototype.getUserDraftRequisitions)


router.resource('/documents',DocumentController).apiOnly();
router.resource('/equipment',EquipmentController).apiOnly();

router.get('/car/documents/:id',CarsController.prototype.getCarDocuments);
router.get('/car/equipments/:id',CarsController.prototype.getCarEquipments);

router.post('/car/documents/:id',DocumentController.prototype.addCarDocuments);
router.post('/car/equipments/:id',EquipmentController.prototype.addCarEquipments);
router.get('/all/equipments/documents/:id',CarsController.prototype.getAllCarEquipmentsAndDocuments);

router.resource('article_categories', ArticleCategoriesController).apiOnly();
router.resource('stocks',StocksController).apiOnly();
router.resource('notifications',NotificationsController).apiOnly();
router.resource('operations',OperationsController).apiOnly();
router.resource('departments',DepartmentsController).apiOnly();

router.resource('budgets',BudgetsController).apiOnly();

}).prefix('/api');

router.get('/attachments/:filename', RequisitionsController.prototype.serveAttachment);