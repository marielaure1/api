import express from 'express'
import { request, allData, createData, showData, updateData, deleteData, searchData} from '../controllers/FavoritesController.js'

let favoritesRoutes = express.Router()
favoritesRoutes.route('').get(allData)  // Récupérer tous les favoris
favoritesRoutes.route('/:id').get(showData)  // Récupérer une favoris
favoritesRoutes.route('').post(request, createData)  // Ajouter une favoris
favoritesRoutes.route('/:id').put(request, updateData)  // Modifier une favoris
favoritesRoutes.route('/:id').delete(deleteData)  // Supprimer une favoris

export default favoritesRoutes