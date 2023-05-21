import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const request = async (req, res, next) => {

    const { title, image, body, slug, published, published_at, user_id } = req.body

    if(!title || !image || !body || !slug || !user_id ){

        let titleError = (title && title.trim() == "") ??  "Veuillez saisir un titre."
        let imageError = (image && image == "") ??  "Veuillez choisir une image."
        let bodyError = (body && body.trim() == "") ??  "Veuillez écrire votre article."
        let slugError = (slug && slug.trim() == "") ??  "Veuillez saisir un slug."
        let userIdError = (slug && slug == "") ??  "Veuillez choisir un utilisateur."

        res.status(422).json({
            error: { titleError, imageError, bodyError, slugError, userIdError }
        })
    }

    res.title = title
    res.image = image
    res.body = body
    res.slug = slug
    res.user_id = user_id
    res.published = published
    res.published_at = published_at

    next()
}

export const allData = async (req, res) => {

    try{
        const allProduct = await prisma.posts.findMany()

        if(!allProduct){
            throw new Error("Error Posts")
        }

        res.json({
            allProduct
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Posts"){
            message = "Il n'y a aucun articles."
        }

        res.status(code).json({
            message
        })
    }
}

export const createData = async (req, res) => {
    const { title, image, body, published, published_at, user_id  } = res
    let slug = res.slug

    slug = await generateSlug(slug)

    try{

        const createProduct = await prisma.posts.create({
            data: {
                title, image, body, slug, published, published_at, user_id
            },
        });

        if(!createProduct){
            throw new Error("Error Create")
        }

        res.status(200).json({
            message: "L'article a été créé avec succès."
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Create"){
            message = "Une erreur c'est produite lors de la création de l'article."
        }

        res.status(code).json({
            message
        })
    }
}

export const showData = async (req, res) => {
    const slug = req.params.slug

    try{
        const showProduct = await prisma.posts.findFirst({
            where: {
              slug: slug
            },
          })

        if(!showProduct){
            throw new Error("Error Posts")
        }

        res.json({
            showProduct
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Posts"){
            message = "Il n'y a aucun articles."
        }

        res.status(code).json({
            message
        })
    }
}

export const updateData = async(req, res) => {
    const { title, image, body, published, published_at, user_id } = res
    let slug = res.slug
    const id = req.params.id

    slug = await generateSlug(slug)

    try{
        const updateProduct = await prisma.posts.update({ 
            where: {
                id: parseInt(id)
            },
            data: { 
                title, image, body, slug, published, published_at, user_id
            }
        })

        if(!updateProduct){
            throw new Error("Error Update")
        }

        res.json({
            message: "L'article a été modifié avec succès.",
            updateProduct
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Update"){
            message = "Une erreur c'est produite lors de la modification de l'article."
        }

        res.status(code).json({
            message
        })
    }
}

export const deleteData = async(req, res) => {
    const id = req.params.id

    try{
        const deleteProduct = await prisma.posts.delete({ 
            where: {
                id: parseInt(id)
            }
        })

        if(!deleteProduct){
            throw new Error("Error Delete")
        }

        res.json({
            message: "L'article a été supprimé avec succès.",
            deleteProduct
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Delete"){
            message = "Une erreur c'est produite lors de la suppression de l'article."
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
        const searchPosts = await prisma.posts.findMany({
            where: {
              OR: [
                {
                  title: {
                    search: q
                  },
                },
                {
                    body: {
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

          console.log(searchPosts);

        if(!searchPosts){
            throw new Error("Error Search")
        }

        res.json({
            message: "Résultat de votre recherche",
            count: 3,
            searchproduct: searchPosts
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Delete"){
            message = "Une erreur c'est produite lors de la suppression de l'article."
        }

        res.status(code).json({
            message
        })
    }
}

const generateSlug = async (slug) => {
    let slugExist = await prisma.posts.findUnique({
        where: {
            slug: slug,
        },
    })

    let slugNb = 0
    let slugGenerate = slug

    while (slugExist){
        slugGenerate = slug + "-" + slugNb 
        slugNb++

        slugExist = await prisma.posts.findFirst({
            where: {
                slug: slugGenerate,
            },
        })

    }

    slug = slugGenerate

    return slug
}