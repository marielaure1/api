import express from 'express'
import { request, allData, createData, showData, updateData, deleteData } from '../controllers/PlansController.js'
import { createPlanStripe, updatePlanStripe, deletePlanStripe } from '../services/StripeService/StripePlansService.js'

let plansRoutes = express.Router()
plansRoutes.route('').get(allData)  // Récupérer tous les abonnements
plansRoutes.route('/:id').get(showData)  // Récupérer un abonnement
plansRoutes.route('').post(request, createPlanStripe, createData)  // Ajouter un abonnement
plansRoutes.route('/:id').put(request, updatePlanStripe, updateData)  // Modifier un abonnement
plansRoutes.route('/:id').delete(deletePlanStripe, deleteData)  // Supprimer un abonnement

export default plansRoutes