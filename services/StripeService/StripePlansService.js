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
            amount: parseInt(amount), // Montant en centimes (exemple: 9.99 €)
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
    } catch(e){
        let error = "Une erreur c'est produite."
        let code = 500

        console.log(e);

        return res.status(code).json({
            error
        })
    }
      
}

export const updatePlanStripe = async (req, res, next) => {
    const { stripe_id, title, image, slug, description, published } = req.body
    const id = req.params.id

    try{
        let planExist = await prisma.plans.findUnique({
            where: {
                id: parseInt(id),
            },
        })
    
        if(!planExist){
            throw new Error("Error Plan")
        }
    
        const plan = await stripe.plans.update(
            stripe_id ,
            { 
                active: published
              
            }
        );
    
        res.title = title
        res.image = image
        res.slug = slug
        res.description = description
        res.published = published
    
        res.stripe_id = plan.id
    
        next()

    } catch(e){
        let error = "Une erreur c'est produite."
        let code = 500

        if(e == "Error Plan"){
            error = "Cet abonnement n'existe pas."
        }

        console.log(e);
        return res.status(code).json({
            error
        })
    }
    
      
}

export const deletePlanStripe = async (req, res, next) => {
    const id = req.params.id

    try{
        let planExist = await prisma.plans.findUnique({
            where: {
                id: parseInt(id)
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
    } catch(e){
        let error = "Une erreur c'est produite."
        let code = 500

        if(e == "Error Plan" || e == "PrismaClientValidationError:"){
            error = "Cet abonnement n'existe pas."
        }

        console.log(e);

        return res.status(code).json({
            error
        })
    } 
}
