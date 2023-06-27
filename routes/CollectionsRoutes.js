import express from 'express'
import { request, allData, allDataPublished, createData, showData, updateData, deleteData } from '../controllers/CollectionsController.js'

let collectionsRoutes = express.Router()
collectionsRoutes.route('').get(allData)  // Récupérer toutes les collections
collectionsRoutes.route('/client').get(allDataPublished)  // Récupérer toutes les collections
collectionsRoutes.route('/:id').get(showData)  // Récupérer une collection
collectionsRoutes.route('/client/:slug').get(showData)  // Récupérer une collection
collectionsRoutes.route('').post(request, createData)  // Ajouter une collection
collectionsRoutes.route('/:id').put(request, updateData)  // Modifier une collection
collectionsRoutes.route('/:id').delete(deleteData)  // Supprimer une collection

export default collectionsRoutes