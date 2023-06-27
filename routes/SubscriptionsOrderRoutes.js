import express from 'express';
import { createData, allData, showData, updateData, deleteData } from '../controllers/SubscriptionsOrderController.js';
// import { checkout } from "../services/StripeService/StripeSubscriptionsService.js"

const subscriptionsOrderRoutes = express.Router();

// subscriptionsOrderRoutes.route('').get(allData); // Récupérer tous les subscriptions_orders
// subscriptionsOrderRoutes.route('/:id').get(showData); // Récupérer un subscription_order
// subscriptionsOrderRoutes.route('').post(createData); // Ajouter un subscription_order
// subscriptionsOrderRoutes.route('/:id').put(updateData); // Modifier un subscription_order
// subscriptionsOrderRoutes.route('/:id').delete(deleteData); // Supprimer un subscription_order

export default subscriptionsOrderRoutes;
