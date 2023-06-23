import express from 'express'
import { allData, createData, deleteData } from '../controllers/MediasController.js'
import { authentification } from "../middlewares/AuthMiddleware.js"
import multer from 'multer';

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      cb(null, file.originalname); 
    }
});
  
const upload = multer({ storage });

let mediasRoutes = express.Router()
mediasRoutes.route('').get(allData)  // Récupérer tous les medias
mediasRoutes.route('').post(authentification,  upload.single('image'), createData)  // Ajouter un media
mediasRoutes.route('/:id').delete(authentification, deleteData)  // Supprimer un media

export default mediasRoutes