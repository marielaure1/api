import express from 'express'
import { allData, showData } from '../controllers/ErrorsController.js'

let errorsRoutes = express.Router()
errorsRoutes.route('').get(allData)  // Récupérer tous les erreurs
errorsRoutes.route('/:id').get(showData)  // Récupérer une erreur

export default errorsRoutes