import stripePackage from 'stripe'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY 
const stripe = stripePackage(STRIPE_SECRET_KEY);


export const createProductStripe = async (req, res, next) => {
    const { title, images, price, slug, composition, short_description, description, published, stock, plan_id, collection_id, categories } = req.body

    try{
        
        const product = await stripe.products.create({
            name: title,
            images: images,
            default_price_data: price,
            description: description,
            metadata: {
                plan_id,
                collection_id
            }

        });

        res.title = title
        res.images = images
        res.price = price
        res.slug = slug
        res.composition = composition
        res.short_description = short_description
        res.description = description
        res.published = published
        res.stock = stock
        res.plan_id = plan_id
        res.collection_id = collection_id
        res.categories = categories

        res.stripe_id = product.id

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

export const updateProductStripe = async (req, res, next) => {
    const { title, images, price, slug, composition, short_description, description, published, stock, plan_id, collection_id, categories, stripe_id } = req.body

    try{
        let productExist = await prisma.products.findUnique({
            where: {
                id: id,
                stripe_id: stripe_id
            },
        })
    
        if(!productExist){
            throw new Error("Error Product")
        }
    
        const product = await stripe.products.update(
            stripe_id ,
            { 
                name: title,
                images: images,
                default_price: price,
                description: description,
                metadata: {
                    plan_id,
                    collection_id
                }
            }
        );
    
        res.title = title
        res.images = images
        res.price = price
        res.slug = slug
        res.composition = composition
        res.short_description = short_description
        res.description = description
        res.published = published
        res.stock = stock
        res.plan_id = plan_id
        res.collection_id = collection_id
        res.categories = categories

        res.stripe_id = product.id
    
        next()

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Product"){
            message = "Ce produit n'existe pas."
        }

        res.status(code).json({
            message
        })
    }
    
      
}

export const deleteProductStripe = async (req, res, next) => {
    const { id } = req.body

    try{
        let productExist = await prisma.products.findUnique({
            where: {
                id: id
            },
        })
    
        if(!productExist){
            throw new Error("Error Product")
        }

        const product = await stripe.products.del(
            productExist.stripe_id
        )
    
        res.id = product.id
    
        next()
    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Product"){
            message = "Ce produit n'existe pas."
        }

        res.status(code).json({
            message
        })
    } 
}
