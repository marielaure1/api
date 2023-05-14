import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const request = async (req, res, next) => {

    const { title, images, price, slug, description } = req.body

    if(!title || !images || !price || !slug || !description){

        let titleError = (title && title.trim() == "") ??  "Veuillez saisir un titre."
        let imagesError = (images && images == "") ??  "Veuillez choisir au moins une image."
        let priceError = (price && price == "") ??  "Veuillez saisir un prix."
        let slugError = (slug && slug.trim() == "") ??  "Veuillez saisir un slug."
        let descriptionError = (description && description.trim() == "") ??  "Veuillez saisir une description."

        res.status(422).json({
            error: { titleError, imagesError, priceError, slugError, descriptionError }
        })
    }

    res.title = title
    res.images = images
    res.price = price
    res.slug = slug
    res.description = description

    next()
}

export const allData = async (req, res) => {

    try{
        const allSubscriptions = await prisma.subscriptions.findMany()

        if(!allSubscriptions){
            throw new Error("Error Plans")
        }

        res.json({
            allSubscriptions
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Plans"){
            message = "Il n'y a aucun abonnement."
        }

        res.status(code).json({
            message
        })
    }
}

export const createData = async (req, res) => {
    const { title, images, price, description } = res
    let slug = res.slug

    slug = await generateSlug(slug)

    console.log({ title, images, price, slug, description })

    try{

        const createSubscriptions = await prisma.subscriptions.create({
            data: { 
                title, images, price, slug, description
            },
        })

        if(!createSubscriptions){
            throw new Error("Error Create")
        }

        res.status(200).json({
            message: "L'abonnement a été créé avec succès."
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Create"){
            message = "Une erreur c'est produite lors de la création de l'abonnement."
        }

        res.status(code).json({
            message
        })
    }
}

export const showData = async (req, res) => {
    const id = req.params.id

    try{
        const showSubscriptions = await prisma.subscriptions.findUnique({
            where: {
              id: parseInt(id)
            },
          })

        if(!showSubscriptions){
            throw new Error("Error Plans")
        }

        res.json({
            showSubscriptions
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Plans"){
            message = "Il n'y a aucun abonnement."
        }

        res.status(code).json({
            message
        })
    }
}

export const updateData = async(req, res) => {
    const { title, images, price, description } = res
    let slug = res.slug
    const id = req.params.id

    slug = await generateSlug(slug)

    try{
        const updateSubscriptions = await prisma.subscriptions.update({ 
            where: {
                id: parseInt(id)
            },
            data: { 
                title, images, price, slug, description
            }
        })

        if(!updateSubscriptions){
            throw new Error("Error Update")
        }

        res.json({
            message: "L'abonnement a été modifié avec succès.",
            updateSubscriptions
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Update"){
            message = "Une erreur c'est produite lors de la modification de l'abonnement."
        }

        res.status(code).json({
            message
        })
    }
}

export const deleteData = async(req, res) => {
    const id = req.params.id

    try{
        const deleteSubscriptions = await prisma.subscriptions.delete({ 
            where: {
                id: parseInt(id)
            }
        })

        if(!deleteSubscriptions){
            throw new Error("Error Delete")
        }

        res.json({
            message: "L'abonnement a été supprimé avec succès.",
            deleteSubscriptions
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Delete"){
            message = "Une erreur c'est produite lors de la suppression de l'abonnement."
        }

        res.status(code).json({
            message
        })
    }
}

const generateSlug = async (slug) => {
    let slugExist = await prisma.subscriptions.findUnique({
        where: {
            slug: slug,
        },
    })

    let slugNb = 0
    let slugGenerate = slug

    while (slugExist){
        slugGenerate = slug + "-" + slugNb 
        slugNb++

        slugExist = await prisma.subscriptions.findUnique({
            where: {
                slug: slugGenerate,
            },
        })

    }

    slug = slugGenerate

    return slug
}