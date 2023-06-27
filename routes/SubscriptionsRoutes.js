import express from 'express'
import { request, allData, createData, showData, updateData, deleteData } from '../controllers/SubscriptionsController.js'
import { webHook, createSubscription, updateSubscriptionStripe, deleteSubscriptionStripe } from '../services/StripeService/StripeSubscriptionsService.js'

let subscriptionsRoutes = express.Router()
subscriptionsRoutes.route('').get(allData)  // Récupérer tous les abonnements des utilisateurs
subscriptionsRoutes.route('/:id').get(showData)  // Récupérer un abonnement d'un utilisateur
subscriptionsRoutes.route('/checkout').post(request, createSubscription)  // Ajouter un abonnement d'un utilisateur
subscriptionsRoutes.route('/create-portal-session').post( createData)  // Ajouter un abonnement d'un utilisateur
// subscriptionsRoutes.route('/webhook').post(webHook)  // Ajouter un abonnement d'un utilisateur

subscriptionsRoutes.route('/:id').put(request, updateSubscriptionStripe, updateData)  // Modifier un abonnement d'un utilisateur
subscriptionsRoutes.route('/:id').delete(deleteSubscriptionStripe, deleteData)  // Supprimer un abonnement d'un utilisateur

export default subscriptionsRoutes