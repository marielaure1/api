import express from 'express'
import { request, register, login, loginAdmin, logout, me, updateMe, resetTokenEmail, resetTokenLinkExist, resetPassword} from '../controllers/AuthController.js'
import { authentification } from "../middlewares/AuthMiddleware.js"


let authRoutes = express.Router()
authRoutes.route('/register').post(request, register)  // S'inscrire
authRoutes.route('/login').post(login)  // Se connecter
authRoutes.route('/loginAdmin').post(loginAdmin)  // Se connecter au backoffice
authRoutes.route('/logout').post(authentification, logout)  // Se déconnecter
authRoutes.route('/me').get(authentification, me)  // Récuperer les données de la personne connecter
authRoutes.route('/me-update/:id').post(authentification, updateMe)  // Récuperer les données de la personne connecter
authRoutes.route('/reset-password').post( resetTokenEmail)  // Récuperer les données de la personne connecter
authRoutes.route('/reset-password/{token}').get( resetTokenLinkExist)  // Récuperer les données de la personne connecter
authRoutes.route('/reset-password/{token}').post( resetPassword)  // Récuperer les données de la personne connecter

export default authRoutes