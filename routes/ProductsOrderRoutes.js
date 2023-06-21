import express from 'express';
import { allData, createData, showData, updateData, deleteData } from '../controllers/ProductsOrderController.js';

const productsOrderRoutes = express.Router();

productsOrderRoutes.route('').get(allData); // Récupérer tous les products_orders
productsOrderRoutes.route('/:id').get(showData); // Récupérer un product_order
productsOrderRoutes.route('').post(createData); // Ajouter un product_order
productsOrderRoutes.route('/:id').put(updateData); // Modifier un product_order
productsOrderRoutes.route('/:id').delete(deleteData); // Supprimer un product_order

export default productsOrderRoutes;
