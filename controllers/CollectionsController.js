import { PrismaClient } from '@prisma/client'
import { DateTime } from "luxon";

const dt = DateTime.local(2017, 5, 15, 8, 30);

const prisma = new PrismaClient()

export const request = async (req, res, next) => {

    const { title, image, published, limite } = req.body

    if(!title || !image ){

        let titleError = (!title || title.trim() == "") ?  "Veuillez saisir un titre." : ""
        let imageError = (!image || image == "") ?  "Veuillez choisir au moins une image." : ""
        // let limiteError = (limite && limite == "") ??  "Veuillez choisir une date limite."
      

        return res.status(422).json({
            errors: { titleError, imageError }
        })
    }

    console.log("request");

    res.title = title
    res.image = image
    res.published = published
    res.limite = limite

    next()
}

export const allDataPublished = async (req, res) => {

    try{
        const allCollection = await prisma.collections.findMany({
            where: {
                published: true
            }
        })

        if(!allCollection){
            throw new Error("Error Collections")
        }

        return res.json({
            allCollection
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Collections"){
            message = "Il n'y a aucune collection."
        }

        return res.status(code).json({
            message
        })
    }
}
export const allData = async (req, res) => {

    try{
        const allCollection = await prisma.collections.findMany()

        if(!allCollection){
            throw new Error("Error Collections")
        }

        return res.json({
            allCollection
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Collections"){
            message = "Il n'y a aucune collection."
        }

        return res.status(code).json({
            message
        })
    }
}

export const createData = async (req, res) => {
    const { title, image, published, limite  } = res
    // let limite = ""

    try{
        let slug = await generateSlug(title)

        const createCollection = await prisma.collections.create({
            data: {
                title, image, slug, published, limite
            },
        });

        if(!createCollection){
            throw new Error("Error Create")
        }

        console.log("ok");

        return res.status(200).json({
            message: "La collection a été créé avec succès.",
            createCollection
        })

    } catch(e){
        let error = "Une erreur c'est produite."
        let code = 500

        if(e == "Error Create"){
            error = "Une erreur c'est produite lors de la création de la collection."
        }

        console.log(e);

        return res.status(code).json({
            error
        })
    }
}

export const showData = async (req, res) => {
    const id = req.params.id
    const slug = req.params.slug

    try{

        let showCollection = ""
        
        if(slug){
            showCollection = await prisma.collections.findFirst({
                where: {
                  slug: slug
                },
                include: {
                    products: true
                }
            })
        } else {
            showCollection = await prisma.collections.findFirst({
                where: {
                  id: parseInt(id)
                },
                include: {
                    products: true
                }
              })
        }

        if(!showCollection){
            throw new Error("Error Collections")
        }

        return res.json({
            showCollection
        })

    } catch(error){
        let message = "Une erreur c'est produite."
        let code = 500

        if(error == "Error Collections"){
            message = "Il n'y a aucune collection."
        }

        return res.status(code).json({
            message
        })
    }
}

export const updateData = async(req, res) => {
    const { title, image, published } = res
    const id = req.params.id

    try{

        let slug = await generateSlug(title)
        
        const updateCollection = await prisma.collections.update({ 
            where: {
                id: parseInt(id)
            },
            data: { 
                title, image, slug, published
            }
        })

        if(!updateCollection){
            throw new Error("Error Update")
        }

        return res.json({
            message: "La collection a été modifié avec succès.",
            updateCollection
        })

    } catch(e){
        let error = "Une erreur c'est produite."
        let code = 500

        if(e == "Error Update"){
            error = "Une erreur c'est produite lors de la modification de la collection."
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

const generateSlug = async (title) => {
    try {
      let slug = title
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-') // Remplace les espaces par des tirets
        .replace(/[^\w\-]+/g, '') // Supprime les caractères non alphanumériques et les tirets
        .replace(/\-\-+/g, '-') // Remplace plusieurs tirets consécutifs par un seul tiret
        .replace(/^-+/, '') // Supprime les tirets en début de chaîne
        .replace(/-+$/, ''); // Supprime les tirets en fin de chaîne

      let slugExist = await prisma.collections.findFirst({
            where: {
              slug: slug,
            },
          });
      let slugNb = 1;
      let slugGenerate = slug;

        while (slugExist) {
          slugGenerate = `${slug}-${slugNb}`;
          slugNb++;

          slugExist = await prisma.collections.findFirst({
            where: {
              slug: slugGenerate,
            },
          });
        }
      

      slug = slugGenerate;

      return slug;
    } catch (error) {
      console.log(error);
    }
  };