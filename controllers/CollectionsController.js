import { PrismaClient } from '@prisma/client'
import { DateTime } from "luxon";

const dt = DateTime.local(2017, 5, 15, 8, 30);

const prisma = new PrismaClient()

export const request = async (req, res, next) => {

    const { title, image, slug, published } = req.body

    if(!title || !image  || !slug ){

        let titleError = (title && title.trim() == "") ??  "Veuillez saisir un titre."
        let imageError = (image && image == "") ??  "Veuillez choisir au moins une image."
        // let limiteError = (limite && limite == "") ??  "Veuillez choisir une date limite."
        let slugError = (slug && slug.trim() == "") ??  "Veuillez choisir un slug."
      

        res.status(422).json({
            error: { titleError, imageError, slugError }
        })
    }

    console.log("request");

    res.title = title
    res.image = image
    res.slug = slug
    res.published = published
    // res.limite = limite

    next()
}

export const allData = async (req, res) => {

    try{
        const allCollection = await prisma.collections.findMany()

        if(!allCollection){
            throw new Error("Error Collections")
        }

        res.json({
            allCollection
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Collections"){
            message = "Il n'y a aucune collection."
        }

        res.status(code).json({
            message
        })
    }
}

export const createData = async (req, res) => {
    const { title, image, published  } = res
    let slug = res.slug
    // let limite = ""

    slug = await generateSlug(slug)

    console.log({title, image, slug, published});

    try{

        const createCollection = await prisma.collections.create({
            data: {
                title, image, slug, published
            },
        });

        console.log("create");

        if(!createCollection){
            throw new Error("Error Create")
        }

        res.status(200).json({
            message: "La collection a été créé avec succès."
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Create"){
            message = "Une erreur c'est produite lors de la création de la collection."
        }

        console.log(error);

        res.status(code).json({
            message
        })
    }
}

export const showData = async (req, res) => {
    const slug = req.params.slug

    try{
        const showCollection = await prisma.collections.findFirst({
            where: {
              slug: slug
            },
          })

        if(!showCollection){
            throw new Error("Error Collections")
        }

        res.json({
            showCollection
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Collections"){
            message = "Il n'y a aucune collection."
        }

        res.status(code).json({
            message
        })
    }
}

export const updateData = async(req, res) => {
    const { title, image, published, limite } = res
    let slug = res.slug
    const id = req.params.id

    slug = await generateSlug(slug)

    try{
        const updateCollection = await prisma.collections.update({ 
            where: {
                id: parseInt(id)
            },
            data: { 
                title, image, slug, published, limite
            }
        })

        if(!updateCollection){
            throw new Error("Error Update")
        }

        res.json({
            message: "La collection a été modifié avec succès.",
            updateCollection
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Update"){
            message = "Une erreur c'est produite lors de la modification de la collection."
        }

        res.status(code).json({
            message
        })
    }
}

export const deleteData = async(req, res) => {
    const id = req.params.id

    try{
        const deleteCollection = await prisma.collections.delete({ 
            where: {
                id: parseInt(id)
            }
        })

        if(!deleteCollection){
            throw new Error("Error Delete")
        }

        res.json({
            message: "La collection a été supprimé avec succès.",
            deleteCollection
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Delete"){
            message = "Une erreur c'est produite lors de la suppression de la collection."
        }

        res.status(code).json({
            message
        })
    }
}

const generateSlug = async (slug) => {
    let slugExist = await prisma.collections.findFirst({
        where: {
            slug: slug,
        },
    })

    let slugNb = 0
    let slugGenerate = slug

    while (slugExist){
        slugGenerate = slug + "-" + slugNb 
        slugNb++

        slugExist = await prisma.collections.findFirst({
            where: {
                slug: slugGenerate,
            },
        })

    }

    slug = slugGenerate

    return slug
}