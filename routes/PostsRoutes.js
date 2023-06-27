import express from 'express'
import { request, allData, allDataPublished, createData, showData, updateData, deleteData, searchData} from '../controllers/PostsController.js'
import { authentification } from "../middlewares/AuthMiddleware.js"

let postsRoutes = express.Router()
postsRoutes.route('').get(allData)  // Récupérer tous les articles
postsRoutes.route('/client').get(allDataPublished)  // Récupérer tous les articles
postsRoutes.route('/:id').get(showData)  // Récupérer une article
postsRoutes.route('/client/:slug').get(showData)  // Récupérer une article
postsRoutes.route('').post(authentification, request, createData)  // Ajouter une article
postsRoutes.route('/:id').put(authentification, request, updateData)  // Modifier une article
postsRoutes.route('/:id').delete(authentification, deleteData)  // Supprimer une article
postsRoutes.route('/').get(authentification, searchData)  // Rechercher des articles

export default postsRoutes