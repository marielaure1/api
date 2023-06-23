import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const request = async (req, res, next) => {

    const { title, image, amount, slug, description, published, interval } = req.body

    if(!title || !image || !amount || !slug || !description || !interval){

        let titleError = (title && title.trim() == "") ??  "Veuillez saisir un titre."
        let imageError = (image && image == "") ??  "Veuillez choisir au moins une image."
        let amountError = (amount && amount == "") ??  "Veuillez saisir un prix."
        let slugError = (slug && slug.trim() == "") ??  "Veuillez saisir un slug."
        let descriptionError = (description && description.trim() == "") ??  "Veuillez saisir une description."
        let intervalError = (interval && interval.trim() == "") ??  "Veuillez saisir une intervale de facturation."

        res.status(422).json({
            error: { titleError, imageError, amountError, slugError, descriptionError, intervalError }
        })
    }

    res.title = title
    res.image = image
    res.amount = amount
    res.slug = slug
    res.description = description
    res.published = published
    res.interval = interval

    next()
}

export const allData = async (req, res) => {

    try{
        const allPlans = await prisma.plans.findMany()

        if(!allPlans){
            throw new Error("Error Plans")
        }

        res.json({
            allPlans
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

    const stripe_id = res.stripe_id;

    const { title, image, amount, description, published, interval } = res
    let slug = res.slug

    slug = await generateSlug(slug)

    try{

        const createPlans = await prisma.plans.create({
            data: { 
                title, image, amount, slug, description, published, stripe_id, interval
            },
        })

        if(!createPlans){
            throw new Error("Error Create")
        }

        res.status(200).json({
            createPlans,
            message: "L'abonnement a été créé avec succès."
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Create"){
            message = "Une erreur c'est produite lors de la création de l'abonnement."
        }

        console.log(error);

        res.status(code).json({
            message
        })
    }
}

export const showData = async (req, res) => {
    const id = req.params.id

    try{
        const showPlans = await prisma.plans.findUnique({
            where: {
              id: parseInt(id)
            },
          })

        if(!showPlans){
            throw new Error("Error Plans")
        }

        res.json({
            showPlans
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Plans"){
            message = "Il n'y a aucun abonnement."
        }

        console.log(error);
        res.status(code).json({
            message
        })
    }
}

export const updateData = async(req, res) => {
    const { title, image, amount, description, published, interval } = res
    let slug = res.slug
    const id = req.params.id

    slug = await generateSlug(slug)

    try{
        const updatePlans = await prisma.plans.update({ 
            where: {
                id: parseInt(id)
            },
            data: { 
                title, image, amount, slug, description, published, interval
            }
        })

        if(!updatePlans){
            throw new Error("Error Update")
        }

        res.json({
            message: "L'abonnement a été modifié avec succès.",
            updatePlans
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
        const deletePlans = await prisma.plans.delete({ 
            where: {
                id: parseInt(id)
            }
        })

        if(!deletePlans){
            throw new Error("Error Delete")
        }

        res.json({
            message: "L'abonnement a été supprimé avec succès.",
            deletePlans
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
    let slugExist = await prisma.plans.findFirst({
        where: {
            slug: slug,
        },
    })

    let slugNb = 0
    let slugGenerate = slug

    while (slugExist){
        slugGenerate = slug + "-" + slugNb 
        slugNb++

        slugExist = await prisma.plans.findFirst({
            where: {
                slug: slugGenerate,
            },
        })

    }

    slug = slugGenerate

    return slug
}