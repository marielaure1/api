import express from 'express'
import { request, allData, createData, showData, updateData, deleteData } from '../controllers/SubscriptionsController.js'

let plansRoutes = express.Router()
plansRoutes.route('').get(allData)  // Récupérer tous les abonnements des utilisateurs
plansRoutes.route('/:id').get(showData)  // Récupérer un abonnement d'un utilisateur
plansRoutes.route('').post(request, createData)  // Ajouter un abonnement d'un utilisateur
plansRoutes.route('/:id').put(request, updateData)  // Modifier un abonnement d'un utilisateur
plansRoutes.route('/:id').delete(deleteData)  // Supprimer un abonnement d'un utilisateur

export default plansRoutes