import express from 'express'
import { request } from '../services/StripeService/StripeBalanceService.js'

let balanceRoutes = express.Router()
balanceRoutes.route('').get(allData)  // Récupérer tous les abonnements
balanceRoutes.route('/:id').get(showData)  // Récupérer un abonnement

export default balanceRoutes