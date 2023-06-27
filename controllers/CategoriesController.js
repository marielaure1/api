import { PrismaClient } from '@prisma/client'
import { DateTime } from "luxon";

const dt = DateTime.local(2017, 5, 15, 8, 30);

const prisma = new PrismaClient()

export const request = async (req, res, next) => {

    const { name } = req.body

    if(!name ){

        let nameError = (!title || name.trim() == "") ?  "Veuillez saisir un nom de catégorie." : ""

        return res.status(422).json({
            errors: { nameError }
        })
    }

    res.name = name

    next()
}

export const allDataPublished = async (req, res) => {

    try{
        const allCategorie = await prisma.categories.findMany({
            where: {
                published: true
            },
            include:{
                products: true,
                promo_codes: true
            }
        })

        if(!allCategorie){
            throw new Error("Error Categories")
        }

        return res.json({
            allCategorie
        })

    } catch(e){
        let error = "Une erreur c'est produite."
        let code = 500

        if(e == "Error Categories"){
            error = "Il n'y a aucune Categorie."
        }

        console.log(e);

        return res.status(code).json({
            error
        })
    }
}
export const allData = async (req, res) => {

    try{
        const allCategorie = await prisma.categories.findMany({
            include:{
                products: true,
                promo_codes: true
            }
        })

        if(!allCategorie){
            throw new Error("Error Categories")
        }

        return res.json({
            allCategorie
        })

    } catch(e){
        let error = "Une erreur c'est produite."
        let code = 500

        if(e == "Error Categories"){
            error = "Il n'y a aucune Categorie."
        }

        return res.status(code).json({
            error
        })
    }
}

export const createData = async (req, res) => {
    const { name  } = res

    
    try{

        const createCategorie = await prisma.categories.create({
            data: {
               name
            }
        });

        if(!createCategorie){
            throw new Error("Error Create")
        }


        return res.status(200).json({
            message: "La Categorie a été créé avec succès.",
            createCategorie
        })

    } catch(e){
        let error = "Une erreur c'est produite."
        let code = 500

        if(e == "Error Create"){
            error = "Une erreur c'est produite lors de la création de la Categorie."
        }

        console.log(e);

        return res.status(code).json({
            error
        })
    }
}

export const showData = async (req, res) => {
    const id = req.params.id

    

    try{

        let showCategorie = await prisma.categories.findFirst({
            where: {
                id: parseInt(id)
            },
            include:{
                products: true,
                promo_codes: true
            }
        })

        if(!showCategorie){
            throw new Error("Error Categories")
        }

        return res.json({
            showCategorie
        })

    } catch(e){
        let error = "Une erreur c'est produite."
        let code = 500

        if(e == "Error Categories"){
            error = "Il n'y a aucune Categorie."
        }

        console.log(e);
        return res.status(code).json({
            error
        })
    }
}

export const updateData = async(req, res) => {
    const { name } = res
    const id = req.params.id

    try{
        
        const updateCategorie = await prisma.categories.update({ 
            where: {
                id: parseInt(id)
            },
            data: { 
                name
            },
            include:{
                products: true,
                promo_codes: true
            }
        })

        if(!updateCategorie){
            throw new Error("Error Update")
        }

        return res.json({
            message: "La Categorie a été modifié avec succès.",
            updateCategorie
        })

    } catch(e){
        let error = "Une erreur c'est produite."
        let code = 500

        if(e == "Error Update"){
            error = "Une erreur c'est produite lors de la modification de la Categorie."
        }

        console.log(e);

        return res.status(code).json({
            error
        })
    }
}

export const deleteData = async(req, res) => {
    const id = req.params.id

    try{
        const deleteCategorie = await prisma.Categories.delete({ 
            where: {
                id: parseInt(id)
            }
        })

        if(!deleteCategorie){
            throw new Error("Error Delete")
        }

        res.json({
            message: "La Categorie a été supprimé avec succès.",
            deleteCategorie
        })

    } catch(e){
        let error = "Une erreur c'est produite."
        let code = 500

        if(e == "Error Delete"){
            error = "Une erreur c'est produite lors de la suppression de la Categorie."
        }

        console.log(e);

        res.status(code).json({
            error
        })
    }
}
