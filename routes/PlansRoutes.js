import express from 'express'
import { request, allData, allDataPublished, createData, showData, updateData, deleteData } from '../controllers/PlansController.js'
import {  updatePlanStripe, createPlan, deletePlanStripe } from '../services/StripeService/StripePlansService.js'
import { authentification } from "../middlewares/AuthMiddleware.js"

let plansRoutes = express.Router()
plansRoutes.route('').get(allData)  // Récupérer tous les abonnements
plansRoutes.route('/published').get(allDataPublished)  // Récupérer tous les abonnements
plansRoutes.route('/:id').get(showData)  // Récupérer un abonnement
plansRoutes.route('').post(authentification, request, createPlan, createData)  // Ajouter un abonnement
plansRoutes.route('/:id').put(authentification, updatePlanStripe, updateData)  // Modifier un abonnement
plansRoutes.route('/:id').delete(authentification, deletePlanStripe, deleteData)  // Supprimer un abonnement

export default plansRoutes