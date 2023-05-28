import express from 'express'
import { retrieveBalanceStripe, listBalanceStripe } from '../services/StripeService/StripeBalanceService.js'
import { createChargeStripe, retrieveChargeStripe, updateChargeStripe, listChargeStripe, captureChargeStripe } from '../services/StripeService/StripeChargeService.js'

let stripeRoutes = express.Router()
stripeRoutes.route('/balance_transactions').get(listBalanceStripe)  // Récupérer toutes les transactions
stripeRoutes.route('/balance_transactions/:id').get(retrieveBalanceStripe)  // Récupérer une transaction

stripeRoutes.route('/charges').post(createChargeStripe)  // Créer une charge
stripeRoutes.route('/charges/:id').get(retrieveChargeStripe)  // Récupérer une charge
stripeRoutes.route('/charges/:id').put(updateChargeStripe)  // Modifier une charge
stripeRoutes.route('/charges').get(listChargeStripe)  // Modifier une charge
stripeRoutes.route('/charges/:id/capture').post(captureChargeStripe)  // Caputrer une charge

export default stripeRoutes