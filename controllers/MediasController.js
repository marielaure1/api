import { PrismaClient } from '@prisma/client'
import cloudinary from 'cloudinary';
import multer from 'multer';
import fs from 'fs';
import { parse } from 'path';

const { CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env
const cloud = cloudinary.v2

cloud.config({
    // secure: true,
    cloud_name: CLOUDINARY_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

// console.log(cloud.config());

const prisma = new PrismaClient()

export const allData = async (req, res) => {

    try {
        const allData = await prisma.medias.findMany()

        return res.status(200).json({
            allData
        });
    } catch (error) {
        res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération des images.' });
    }
}

export const createData = async (req, res) => {

    const { title, alt } = req.body

    try {
        if (!req.file) {
            throw new Error('Aucun fichier n\'a été téléchargé.');
          }
      
          const result = await cloud.uploader.upload(req.file.path, {
            folder: 'youvence'
          });
      
          console.log(result);  
          const mediaData = await prisma.medias.create({
           data: {
            title,
            alt,
            url: result.secure_url,
            public_id: result.public_id,
           }
          });
      
          fs.unlinkSync(req.file.path);
      
          return res.status(200).json({
            mediaData: mediaData
          });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Une erreur s\'est produite lors de l\'ajout de l\'image.' });
    }
}

export const deleteData = async (req, res) => {

    const id = req.params.id

    try {
        const result = await cloudinary.uploader.destroy(id);

        const deleteData = await prisma.medias.delete({ 
            where: {
                id: parseInt(id)
            }
        })

        return res.status(200).json({
            message: "Image supprimé avec succès"
          });
    } catch (error) {

        console.log(error);
        return res.status(500).json({ error: 'Une erreur s\'est produite lors de la suppression de l\'image.' });
    }
}