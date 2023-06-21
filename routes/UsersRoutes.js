import express from 'express'
import {  allData, createData, showData, updateData, updatePassword, deleteData} from '../controllers/UsersController.js'

let usersRoutes = express.Router()
usersRoutes.route('').get(allData)  // Récupérer tous les users
usersRoutes.route('/:id').get(showData)  // Récupérer un user
usersRoutes.route('').post(createData)  // Ajouter un user
usersRoutes.route('/:id').put(updateData)  // Modifier un user
usersRoutes.route('/:id/password').put(updatePassword)  // Modifier le mot de passe d'un user
usersRoutes.route('/:id').delete(deleteData)  // Supprimer un user

export default usersRoutes