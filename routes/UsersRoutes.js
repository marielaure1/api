import express from 'express'
import { request, allData, createData, showData, updateData, deleteData} from '../controllers/UsersController.js'

let usersRoutes = express.Router()
usersRoutes.route('').get(allData)  // Récupérer tous les users
usersRoutes.route('/:id').get(showData)  // Récupérer un user
usersRoutes.route('').post(request, createData)  // Ajouter un user
usersRoutes.route('/:id').put(request, updateData)  // Modifier un user
usersRoutes.route('/:id').delete(deleteData)  // Supprimer un user

export default usersRoutes