import express from 'express'
import { request, allData, createData, showData, updateData, deleteData} from '../controllers/UsersController.js'
import { createCustomerStripe, updateCustomerStripe, deleteCustomerStripe } from '../services/StripeService/StripeCustomersService.js'

let usersRoutes = express.Router()
usersRoutes.route('').get(allData)  // Récupérer tous les users
usersRoutes.route('/:id').get(showData)  // Récupérer un user
usersRoutes.route('').post(request, createCustomerStripe, createData)  // Ajouter un user
usersRoutes.route('/:id').put(request, updateCustomerStripe, updateData)  // Modifier un user
usersRoutes.route('/:id').delete(deleteCustomerStripe, deleteData)  // Supprimer un user

export default usersRoutes