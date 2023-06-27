import express from 'express'
import { request, allData, allDataPublished, createData, showData, updateData, deleteData } from '../controllers/CategoriesController.js'

let categoriesRoutes = express.Router()
categoriesRoutes.route('').get(allData)  // Récupérer toutes les categories
categoriesRoutes.route('/client').get(allDataPublished)  // Récupérer toutes les categories
categoriesRoutes.route('/:id').get(showData)  // Récupérer une categorie
categoriesRoutes.route('/client/:slug').get(showData)  // Récupérer une categorie
categoriesRoutes.route('').post(request, createData)  // Ajouter une categorie
categoriesRoutes.route('/:id').put(request, updateData)  // Modifier une categorie
categoriesRoutes.route('/:id').delete(deleteData)  // Supprimer une categorie

export default categoriesRoutes