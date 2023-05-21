import stripePackage from 'stripe'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY 
const stripe = stripePackage(STRIPE_SECRET_KEY);


export const createSubscriptionStripe = async (req, res, next) => {
    const { user_id, plan_id } = req.body

    try{
    
        // Créer un abonnement avec l'API Stripe
        const subscription = await stripe.subscriptions.create({
            customer: user_id,
            items: [{ plan: plan_id }],
            billing_cycle_anchor: 'now',
            cancel_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 90, // Annuler l'abonnement après 90 jours
        });
    
        res.subscription = subscription
        res.user_id = user_id
        res.plan_id = plan_id

        next()
    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        console.log(error);
        res.status(code).json({
            message
        })
    }
      
}

export const updateSubscriptionStripe = async (req, res, next) => {
    const { id, subscription_id, user_id, plan_id } = req.body

    try{
        let subscriptionExist = await prisma.subscriptions.findUnique({
            where: {
                id: id,
                subscription_id: subscription_id
            },
        })
    
        if(!subscriptionExist){
            throw new Error("Error Subscription")
        }
    
        const subscription = await stripe.subscriptions.update(
            subscription_id,
            {
            customer: user_id,
            items: [{ plan: plan_id }],
            billing_cycle_anchor: 'now',
            trial_period_days: 0,
            billing_thresholds: {
            amount_gte: 0,
            reset_billing_cycle_anchor: true,
            },
            cancel_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 90, // Annuler l'abonnement après 90 jours
        });
    
        res.subscription = subscription
        res.user_id = user_id
        res.plan_id = plan_id
        res.id = id

        next()

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Subscription"){
            message = "Cet abonnement n'existe pas."
        }

        res.status(code).json({
            message
        })
    }
    
      
}

export const deleteSubscriptionStripe = async (req, res, next) => {
    const { id } = req.body

    try{

        let subscriptionExist = await prisma.subscriptions.findUnique({
            where: {
                id: id
            },
        })
    
        if(!subscriptionExist){
            throw new Error("Error Subscription")
        }

        const subscription = await stripe.subscriptions.del(
            subscriptionExist.subscription_id
        );
    
        res.id = id
    
        next()
    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Subscription"){
            message = "Cet abonnement n'existe pas."
        }

        res.status(code).json({
            message
        })
    }
}