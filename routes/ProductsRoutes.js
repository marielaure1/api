import express from 'express'
import { request, allData, createData, showData, updateData, deleteData, searchData} from '../controllers/ProductsController.js'

let productsRoutes = express.Router()
productsRoutes.route('').get(allData)  // Récupérer tous les produits
productsRoutes.route('/:id').get(showData)  // Récupérer une produit
productsRoutes.route('').post(request, createData)  // Ajouter une produit
productsRoutes.route('/:id').put(request, updateData)  // Modifier une produit
productsRoutes.route('/:id').delete(deleteData)  // Supprimer une produit
productsRoutes.route('/').get(searchData)  // Rechercher des produits

export default productsRoutes