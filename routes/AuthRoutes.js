import express from 'express'
import { request, register, login, logout, me, resetTokenEmail, resetTokenLinkExist, resetPassword} from '../controllers/AuthController.js'
import { authentification } from "../middlewares/AuthMiddleware.js"


let authRoutes = express.Router()
authRoutes.route('/register').post(request, register)  // S'inscrire
authRoutes.route('/login').post(login)  // Se connecter
authRoutes.route('/logout').post(authentification, logout)  // Se déconnecter
authRoutes.route('/me').post(authentification, me)  // Récuperer les données de la personne connecter
authRoutes.route('/reset-password').post( resetTokenEmail)  // Récuperer les données de la personne connecter
authRoutes.route('/reset-password/{token}').get( resetTokenLinkExist)  // Récuperer les données de la personne connecter
authRoutes.route('/reset-password/{token}').post( resetPassword)  // Récuperer les données de la personne connecter

export default authRoutes