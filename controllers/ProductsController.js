import { PrismaClient } from '@prisma/client'
import { parse } from 'dotenv'

const prisma = new PrismaClient()

export const request = async (req, res, next) => {

    const { title, images, price, composition, short_description, description, published, stock, plan_id, collection_id, categories } = req.body

    if(!title || !images || !price ){

        let titleError = (!title || title.trim() == "") ?  "Veuillez saisir un titre." : ""
        let imagesError = (!images || images == "") ?  "Veuillez choisir au moins une image." : ""
        let priceError = (!price || price == "") ?  "Veuillez saisir un prix." : ""
        let stockError = (!stock || stock == "") ?  "Veuillez saisir un stock." : ""
        let compositionError = (!composition || composition.trim() == "") ?  "Veuillez saisir une composition." : ""
        let collection_idError = (!collection_id || collection_id.trim() == "") ?  "Veuillez saisir une collection." : ""
        let plan_idError = (!plan_id || plan_id.trim() == "") ?  "Veuillez saisir une plan." : ""
        let shortDescriptionError = (!short_description || short_description.trim() == "") ?  "Veuillez saisir une description courte." : ""
        let descriptionError = (!description || description.trim() == "") ?  "Veuillez saisir une description." : ""
        let categoriesError = (!categories || categories.trim() == "") ?  "Veuillez choisir au moins une categorie." : ""

        return res.status(422).json({
            error: { titleError, imagesError, priceError, shortDescriptionError, descriptionError, stockError, compositionError, collection_idError, plan_idError, categoriesError }
        })
    }

    res.title = title
    res.images = images
    res.price = price
    res.short_description = short_description
    res.description = description
    res.composition = composition 
    res.published = published 
    res.stock = stock 
    res.plan_id = plan_id 
    res.collection_id = collection_id 
    res.categories = categories 

    next()
}

export const allData = async (req, res) => {

    try{
        const allProducts = await prisma.products.findMany({
            include:{
                plan: true,
                collection: true,
                categories: true,
            }
        })

        if(!allProducts){
            throw new Error("Error Products")
        }

        res.json({
            allProducts
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Products"){
            message = "Il n'y a aucun produit."
        }

        console.log(error);

        res.status(code).json({
            message
        })
    }
}

export const createData = async (req, res) => {
    const { title, images, price, composition, short_description, description, published, stock, plan_id, collection_id, categories, stripe_id, stripe_price_id } = res

    try{

        let slug = await generateSlug(title)

        const selectedCategories = await prisma.categories.findMany({
        where: {
            id: {
            in: categories,
            },
        },
        });

        const createProduct = await prisma.products.create({
            data: {
                title,
                images,
                price: parseInt(price),
                composition,
                short_description,
                description,
                published,
                slug,
                stock: parseInt(stock),
                plan_id: parseInt(plan_id),
                collection_id: parseInt(collection_id),
                categories,
                stripe_id,
                stripe_price_id,
                categories: {
                    connect: selectedCategories.map((category) => ({
                      id: category.id,
                    })),
                  },
            },
        });

        if(!createProduct){
            throw new Error("Error Create")
        }

        res.status(200).json({
            message: "Le produit a été créé avec succès."
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Create"){
            message = "Une erreur c'est produite lors de la création du produit."
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
        const showProduct = await prisma.products.findFirst({
            where: {
              id: parseInt(id)
            },
            include:{
                plan: true,
                collection: true,
                categories: true,
            }
          })

        if(!showProduct){
            throw new Error("Error Products")
        }

        res.json({
            showProduct
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Products"){
            message = "Il n'y a aucun produit."
        }

        res.status(code).json({
            message
        })
    }
}

export const updateData = async(req, res) => {
    const { title, images, price, composition, short_description, description, published, stock, plan_id, collection_id, categories} = res
    const id = req.params.id

    

    try{

        let slug = await generateSlug(title)
        const updateProduct = await prisma.products.update({ 
            where: {
                id: parseInt(id)
            },
            data: { 
                title, images, price: parseInt(price), composition, short_description, description, published, stock: parseInt(stock), plan_id:parseInt(plan_id), collection_id: parseInt(collection_id), categories
            },
            include:{
                plan: true,
                collection: true
            }
        })

        if(!updateProduct){
            throw new Error("Error Update")
        }

        res.json({
            message: "Le produit a été modifié avec succès.",
            updateProduct
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
    const id = req.params.id

    try{
        const deleteProduct = await prisma.products.delete({ 
            where: {
                id: parseInt(id)
            }
        })

        if(!deleteProduct){
            throw new Error("Error Delete")
        }

        res.json({
            message: "Le produit a été supprimé avec succès.",
            deleteProduct
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

export const searchData = async(req, res) => {
    const q = req.query.q
    
    console.log(q);

    try{
        const searchProduct = await prisma.products.findMany({
            where: {
              OR: [
                {
                  title: {
                    search: q
                  },
                },
                {
                    description: {
                      search: q
                    },
                },
                {
                    slug: {
                      search: q
                    },
                },
              ],
            },
          })

          console.log(searchProduct);

        if(!searchProduct){
            throw new Error("Error Search")
        }

        res.json({
            message: "Résultat de votre recherche",
            count: 3,
            searchproduct: searchProduct
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
        let slugExist = await prisma.products.findFirst({
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
        
                slugExist = await prisma.products.findFirst({
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