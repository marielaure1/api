import stripePackage from 'stripe'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY 
const stripe = stripePackage(STRIPE_SECRET_KEY);


export const createPlanStripe = async (req, res, next) => {
    const { title, image, amount, slug, description, published, interval } = req.body

    try{
        
        const plan = await stripe.plans.create({ 
            active: published,
            amount: amount, // Montant en centimes (exemple: 9.99 €)
            currency: 'eur', // Devise
            interval: interval, // Interval de facturation (exemple: mensuel)
            product: {
                name: title
            },
        });

        res.title = title
        res.image = image
        res.amount = amount
        res.slug = slug
        res.description = description
        res.published = published
        res.interval = interval

        res.stripe_id = plan.id

        next()
    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        res.status(code).json({
            message
        })
    }
      
}

export const updatePlanStripe = async (req, res, next) => {
    const { id, stripe_id, title, image, amount, slug, description, published, interval } = req.body

    try{
        let planExist = await prisma.plans.findUnique({
            where: {
                id: id,
                stripe_id: stripe_id
            },
        })
    
        if(!planExist){
            throw new Error("Error Plan")
        }
    
        const plan = await stripe.plans.update(
            stripe_id ,
            { 
                active: published,
                amount: amount, // Montant en centimes 
                currency: 'eur', 
                interval: interval, // Interval de facturation
                product: {
                    name: title
                },
            }
        );
    
        res.title = title
        res.image = image
        res.amount = amount
        res.slug = slug
        res.description = description
        res.published = published
        res.interval = interval
    
        res.stripe_id = plan.id
    
        next()

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Plan"){
            message = "Cet abonnement n'existe pas."
        }

        res.status(code).json({
            message
        })
    }
    
      
}

export const deletePlanStripe = async (req, res, next) => {
    const { id } = req.body

    try{
        let planExist = await prisma.plans.findUnique({
            where: {
                id: id
            },
        })
    
        if(!planExist){
            throw new Error("Error Plan")
        }

        const plan = await stripe.plans.del(
            planExist.stripe_id
        );
    
        res.id = plan.id
    
        next()
    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Plan"){
            message = "Cet abonnement n'existe pas."
        }

        res.status(code).json({
            message
        })
    } 
}
