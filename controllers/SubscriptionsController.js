import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const request = async (req, res, next) => {

    const { user_id, plan_id  } = req.body

    if(!user_id || !plan_id ){

        let user_idError = (user_id && user_id == "") ??  "Veuillez choisir un utilisateur."
        let plan_idError = (plan_id && plan_id == "") ??  "Veuillez choisir un abonnement."

        res.status(422).json({
            error: { user_idError, plan_idError }
        })
    }

    const user = await prisma.users.findFirst({
        where: {
          id: user_id
        },
      })
    const plan = await prisma.plans.findFirst({
        where: {
          id: plan_id
        },
      })

    res.user = user
    res.plan = plan

    next()
}

export const allData = async (req, res) => {

    try{
        const allPlan = await prisma.plans.findMany()

        if(!allPlan){
            throw new Error("Error Plans")
        }

        res.json({
            allPlan
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
    const { user_id, plan_id, url } = res

    try{

        const createSubscription = await prisma.subscriptions.create({
            data: {
              user_id, plan_id
            },
        });

        if(!createSubscription){
            throw new Error("Error Create")
        }

        // amount

        res.status(200).json({
            message: "L'inscription à l'abonnement a été créé avec succès.",
            url
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Create"){
            message = "Une erreur c'est produite lors de l'inscription à l'abonnement'."
        }

        res.status(code).json({
            message
        })
    }
}

export const showData = async (req, res) => {
    const id = req.params.id

    try{
        const showSubscription = await prisma.subscriptions.findUnique({
            where: {
              id: parseInt(id)
            },
          })

        if(!showSubscription){
            throw new Error("Error Subscriptions")
        }

        res.json({
            showSubscription
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Subscriptions"){
            message = "Il n'y a aucun produit."
        }

        res.status(code).json({
            message
        })
    }
}

export const updateData = async(req, res) => {
    const { id, user_id, plan_id } = res

    try{
        const updateSubscription = await prisma.subscriptions.update({ 
            where: {
                id: id
            },
            data: { 
                user_id, plan_id
            }
        })

        if(!updateSubscription){
            throw new Error("Error Update")
        }

        res.json({
            message: "Le produit a été modifié avec succès.",
            updateSubscription
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Update"){
            message = "Une erreur c'est produite lors de la modification du produit."
        }

        res.status(code).json({
            message
        })
    }
}

export const deleteData = async(req, res) => {
    const {id} = res

    try{
        const deleteSubscription = await prisma.subscriptions.delete({ 
            where: {
                id: id
            }
        })

        if(!deleteSubscription){
            throw new Error("Error Delete")
        }

        res.json({
            message: "Le produit a été supprimé avec succès.",
            deleteSubscription
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Delete"){
            message = "Une erreur c'est produite lors de la suppression du produit."
        }

        res.status(code).json({
            message
        })
    }
}
