import express from 'express';
import { allData, showData, createData, updateData, deleteData } from '../controllers/PromoCodeController.js';

const promoCodeRoutes = express.Router();

promoCodeRoutes.route('').get(allData); // Récupérer tous les codes promo
promoCodeRoutes.route('/:id').get(showData); // Récupérer un code promo
promoCodeRoutes.route('').post(createData); // Ajouter un code promo
promoCodeRoutes.route('/:id').put(updateData); // Modifier un code promo
promoCodeRoutes.route('/:id').delete(deleteData); // Supprimer un code promo

export default promoCodeRoutes;
