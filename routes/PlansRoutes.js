import express from 'express'
import { request, allData, createData, showData, updateData, deleteData } from '../controllers/PlansController.js'

let plansRoutes = express.Router()
plansRoutes.route('').get(allData)  // Récupérer tous les abonnements
plansRoutes.route('/:id').get(showData)  // Récupérer un abonnement
plansRoutes.route('').post(request, createData)  // Ajouter un abonnement
plansRoutes.route('/:id').put(request, updateData)  // Modifier un abonnement
plansRoutes.route('/:id').delete(deleteData)  // Supprimer un abonnement

export default plansRoutes