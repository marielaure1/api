import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const request = async (req, res, next) => {

    const { title, description, images } = req.body

    if(!title || !description || !images){

        let titleError = (title && title.trim() == "") ??  "Veuillez saisir un titre."
        let descriptionError = (description && description.trim() == "") ??  "Veuillez saisir une description."
        let imagesError = (images && images == "") ??  "Veuillez choisir au moins une image."

        res.status(422).json({
            error: { titleError, descriptionError, imagesError }
        })
    }

    res.title = title
    res.description = description
    res.images = images

    next()
}

export const allData = async (req, res) => {

    try{
        const allIngredient = await prisma.ingredients.findMany()

        if(!allIngredient){
            throw new Error("Error Ingredients")
        }

        res.json({
            allIngredient
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Ingredients"){
            message = "Il n'y a aucun ingredient."
        }

        res.status(code).json({
            message
        })
    }
}

export const createData = async (req, res) => {
    const { title, description, images } = res

    console.log({ title, description, images })

    try{

        const createIngredient = await prisma.ingredients.create({
            data: { 
                title: title, 
                description: description, 
                images: images
            },
        })

        if(!createIngredient){
            throw new Error("Error Create")
        }

        res.status(200).json({
            message: "L'ingrédient a été créé avec succès."
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Create"){
            message = "Une erreur c'est produite lors de la création de l'ingrédient."
        }

        res.status(code).json({
            message
        })
    }
}

export const showData = async (req, res) => {
    const id = req.params.id

    try{
        const showIngredient = await prisma.ingredients.findUnique({
            where: {
              id: parseInt(id)
            },
          })

        if(!showIngredient){
            throw new Error("Error Ingredients")
        }

        res.json({
            showIngredient
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Ingredients"){
            message = "Il n'y a aucun ingredient."
        }

        res.status(code).json({
            message
        })
    }
}

export const updateData = async(req, res) => {
    const { title, images, price } = res
    const id = req.params.id

    try{
        const updateIngredient = await prisma.ingredients.update({ 
            where: {
                id: parseInt(id)
            },
            data: { 
                title: title, 
                images: images, 
                price: price
            }
        })

        if(!updateIngredient){
            throw new Error("Error Update")
        }

        res.json({
            message: "L'ingredient a été modifié avec succès.",
            updateIngredient
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Update"){
            message = "Une erreur c'est produite lors de la modification de l'ingredient."
        }

        res.status(code).json({
            message
        })
    }
}

export const deleteData = async(req, res) => {
    const id = req.params.id

    try{
        const deleteIngredient = await prisma.ingredients.delete({ 
            where: {
                id: parseInt(id)
            }
        })

        if(!deleteIngredient){
            throw new Error("Error Delete")
        }

        res.json({
            message: "L'ingredient a été supprimé avec succès.",
            deleteIngredient
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Delete"){
            message = "Une erreur c'est produite lors de la suppression de l'ingredient."
        }

        res.status(code).json({
            message
        })
    }
}