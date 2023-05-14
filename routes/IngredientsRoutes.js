import express from 'express'
import { request, allData, createData, showData, updateData, deleteData } from '../controllers/IngredientsController.js'

let ingredientsRoutes = express.Router()
ingredientsRoutes.route('').get(allData)  // Récupérer tous les ingredients
ingredientsRoutes.route('/:id').get(showData)  // Récupérer une ingredient
ingredientsRoutes.route('').post(request, createData)  // Ajouter une ingredient
ingredientsRoutes.route('/:id').put(request, updateData)  // Modifier une ingredient
ingredientsRoutes.route('/:id').delete(deleteData)  // Supprimer une ingredient

export default ingredientsRoutes