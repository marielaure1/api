import express from 'express'
import { request, allData, createData, showData, updateData, deleteData, searchData} from '../controllers/PostsController.js'

let postsRoutes = express.Router()
postsRoutes.route('').get(allData)  // Récupérer tous les articles
postsRoutes.route('/:id').get(showData)  // Récupérer une article
postsRoutes.route('').post(request, createData)  // Ajouter une article
postsRoutes.route('/:id').put(request, updateData)  // Modifier une article
postsRoutes.route('/:id').delete(deleteData)  // Supprimer une article
postsRoutes.route('/').get(searchData)  // Rechercher des articles

export default postsRoutes