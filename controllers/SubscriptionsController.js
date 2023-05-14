import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const request = async (req, res, next) => {

    const { title, images, price, slug, short_description, description, caracteristiques, plan, categories  } = req.body

    if(!title || !images || !price || !slug ){

        let titleError = (title && title.trim() == "") ??  "Veuillez saisir un titre."
        let imagesError = (images && images == "") ??  "Veuillez choisir au moins une image."
        let priceError = (price && price == "") ??  "Veuillez saisir un prix."
        let slugError = (slug && slug.trim() == "") ??  "Veuillez saisir un slug."

        res.status(422).json({
            error: { titleError, imagesError, priceError, slugError }
        })
    }

    res.title = title
    res.images = images
    res.price = price
    res.slug = slug
    res.short_description = short_description
    res.description = description
    res.caracteristiques = caracteristiques
    res.plan = plan
    res.categories = categories 

    next()
}

export const allData = async (req, res) => {

    try{
        const allProduct = await prisma.products.findMany()

        if(!allProduct){
            throw new Error("Error Products")
        }

        res.json({
            allProduct
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

export const createData = async (req, res) => {
    const { title, images, price, short_description, description, caracteristiques, plan, categories  } = res
    let slug = res.slug

    slug = await generateSlug(slug)

    console.log({ title, images, price, slug, short_description, description, caracteristiques, plan, categories });

    try{

        const createProduct = await prisma.products.create({
            data: {
              title: title,
              images: images,
              price: price,
              slug: slug,
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

        res.status(code).json({
            message
        })
    }
}

export const showData = async (req, res) => {
    const id = req.params.id

    try{
        const showProduct = await prisma.products.findUnique({
            where: {
              id: parseInt(id)
            },
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
    const { title, images, price } = res
    let slug = res.slug
    const id = req.params.id

    slug = await generateSlug(slug)

    try{
        const updateProduct = await prisma.products.update({ 
            where: {
                id: parseInt(id)
            },
            data: { 
                title: title, 
                images: images, 
                price: price, 
                slug: slug 
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
    let slugExist = await prisma.products.findUnique({
        where: {
            slug: slug,
        },
    })

    let slugNb = 0
    let slugGenerate = slug

    while (slugExist){
        slugGenerate = slug + "-" + slugNb 
        slugNb++

        slugExist = await prisma.products.findUnique({
            where: {
                slug: slugGenerate,
            },
        })

    }

    slug = slugGenerate

    return slug
}