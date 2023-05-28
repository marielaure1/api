import express from 'express'
import { request, register, login, logout} from '../controllers/AuthController.js'
import { authentification } from "../middlewares/AuthMiddleware.js"
import { createCustomerStripe } from '../services/StripeService/StripeCustomersService.js'

let authRoutes = express.Router()
authRoutes.route('/register').post(request, createCustomerStripe, register)  // S'inscrire
authRoutes.route('/login').post(login)  // Se connecter
authRoutes.route('/logout').post(authentification, logout)  // Se déconnecter

export default authRoutes