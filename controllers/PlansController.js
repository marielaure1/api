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

        return res.status(422).json({
            errors: { titleError, imageError, amountError, slugError, descriptionError, intervalError }
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

        return res.json({
            allPlans
        })

    } catch(e){
        let error = "Une erreur c'est produite."
        let code = 500

        if(e == "Error Plans"){
            error = "Il n'y a aucun abonnement."
        }

        return res.status(code).json({
            error
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
                title, image, amount: parseInt(amount), slug, description, published, stripe_id, interval
            },
        })

        if(!createPlans){
            throw new Error("Error Create")
        }

        return res.status(200).json({
            createPlans,
            message: "L'abonnement a été créé avec succès."
        })

    } catch(e){
        let error = "Une erreur c'est produite."
        let code = 500

        if(e == "Error Create"){
            error = "Une erreur c'est produite lors de la création de l'abonnement."
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
        const showPlan = await prisma.plans.findUnique({
            where: {
              id: parseInt(id)
            },
        })

        if(!showPlan){
            throw new Error("Error Plans")
        }

        return res.json({
            showPlan
        })

    } catch(e){
        let error = "Une erreur c'est produite."
        let code = 500

        if(e == "Error Plans"){
            error = "Il n'y a aucun abonnement."
        }

        console.log(e);
        return res.status(code).json({
            error
        })
    }
}

export const updateData = async(req, res) => {
    const { title, image, description, published } = res
    let slug = res.slug
    const id = req.params.id

    slug = await generateSlug(slug)

    try{
        const updatePlan = await prisma.plans.update({ 
            where: {
                id: parseInt(id)
            },
            data: { 
                title, image, slug, description, published
            }
        })

        if(!updatePlan){
            throw new Error("Error Update")
        }

        return res.json({
            message: "L'abonnement a été modifié avec succès.",
            updatePlan
        })

    } catch(e){
        let error = "Une erreur c'est produite."
        let code = 500

        if(e == "Error Update"){
            error = "Une erreur c'est produite lors de la modification de l'abonnement."
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
        const deletePlan = await prisma.plans.delete({ 
            where: {
                id: parseInt(id)
            }
        })

        if(!deletePlan){
            throw new Error("Error Delete")
        }

        return res.json({
            message: "L'abonnement a été supprimé avec succès.",
            deletePlan
        })

    } catch(e){
        let error = "Une erreur c'est produite."
        let code = 500

        if(e == "Error Delete" || e == "PrismaClientValidationError:"){
            error = "Une erreur c'est produite lors de la suppression de l'abonnement."
        }

        console.log(e);

        return res.status(code).json({
            error
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