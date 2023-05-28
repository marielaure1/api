import express from 'express'
import { request, allData, createData, showData, updateData, deleteData, searchData} from '../controllers/ProductsController.js'
import { createProductStripe, updateProductStripe, deleteProductStripe } from '../services/StripeService/StripeProductsService.js'

let productsRoutes = express.Router()
productsRoutes.route('').get(allData)  // Récupérer tous les produits
productsRoutes.route('/:id').get(showData)  // Récupérer une produit
productsRoutes.route('').post(request, createProductStripe, createData)  // Ajouter une produit
productsRoutes.route('/:id').put(request, updateProductStripe, updateData)  // Modifier une produit
productsRoutes.route('/:id').delete(deleteProductStripe, deleteData)  // Supprimer une produit
productsRoutes.route('/').get(searchData)  // Rechercher des produits

export default productsRoutes