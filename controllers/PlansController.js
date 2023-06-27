import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const request = async (req, res, next) => {

    const { title, image, amount, description, published, interval} = req.body

    if(!title || !image || !amount || !description || !interval){

        let titleError = (title && title.trim() == "") ??  "Veuillez saisir un titre."
        let imageError = (image && image == "") ??  "Veuillez choisir au moins une image."
        let amountError = (amount && amount == "") ??  "Veuillez saisir un prix."
        let descriptionError = (description && description.trim() == "") ??  "Veuillez saisir une description."
        let intervalError = (interval && interval.trim() == "") ??  "Veuillez saisir une intervale de facturation."

        return res.status(422).json({
            errors: { titleError, imageError, amountError, descriptionError, intervalError }
        })
    }

    res.title = title
    res.image = image
    res.amount = amount
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

export const allDataPublished = async (req, res) => {

    try{
        const allPlans = await prisma.plans.findMany({
            where: {
                published: true,
            }
        })

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

    const { title, image, amount, description, published, interval, lookup_key } = res

    try{

        let slug = await generateSlug(title)

        const createPlans = await prisma.plans.create({
            data: { 
                title, image, amount: parseInt(amount) * 100, slug, description, published, stripe_id, interval, lookup_key
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
    const { title, image, description, published, oldTitle } = res
    const id = req.params.id

    try{

        let slug = oldTitle

        if(oldTitle != title){
            slug = await generateSlug(slug)
        }

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

    try{
        slug.toString()
        .toLowerCase()
        .replace(/\s+/g, '-') // Remplace les espaces par des tirets
        .replace(/[^\w\-]+/g, '') // Supprime les caractères non alphanumériques et les tirets
        .replace(/\-\-+/g, '-') // Remplace plusieurs tirets consécutifs par un seul tiret
        .replace(/^-+/, '') // Supprime les tirets en début de chaîne
        .replace(/-+$/, ''); // Supprime les tirets en fin de chaîne

        console.log(slug);
        let slugExist = await prisma.plans.findFirst({
            where: {
                slug: slug,
            },
        })

        let slugNb = 0
        let slugGenerate = slug

        if(!slugExist){
            while (slugExist){
                slugGenerate = slug + "-" + slugNb 
                slugNb++
        
                slugExist = await prisma.plans.findFirst({
                    where: {
                        slug: slugGenerate,
                    },
                })
        
                console.log(slugExist);
        
            }
        }

        slug = slugGenerate

        console.log(slug);

        return slug
    } catch(error){
        console.log(error);
    }
}