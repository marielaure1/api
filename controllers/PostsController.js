import { PrismaClient } from '@prisma/client'
import { DateTime } from "luxon";

const prisma = new PrismaClient()

export const request = async (req, res, next) => {

    const { title, image, body, published, published_at } = req.body

    if(!title || !image || !body ){

        let titleError = !title || title.trim() == "" ?  "Veuillez saisir un titre." : ""
        let imageError = (image && image == "") ?  "Veuillez choisir une image." : ""
        let bodyError = (body && body.trim() == "") ?  "Veuillez écrire votre article." : ""

        res.status(422).json({
            error: { titleError, imageError, bodyError }
        })
    }

    res.title = title
    res.image = image
    res.body = body
    res.published = published
    // res.published_at = published_at

    next()
}

export const allData = async (req, res) => {

    try{
        const allPost = await prisma.post.findMany()

        if(!allPost){
            throw new Error("Error Posts")
        }

        res.json({
            allPost
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
export const allDataPublished = async (req, res) => {

    try{
        const allPosts = await prisma.post.findMany({
            where: {
                published : true
            }
        })

        if(!allPosts){
            throw new Error("Error Posts")
        }

        res.json({
            allPosts
        })

    } catch(e){
        let error = "Une erreur c'est produite."
        let code = 500

        if(e == "Error Posts"){
            error = "Il n'y a aucun articles."
        }

        console.log(e);
        res.status(code).json({
            error
        })
    }
}

export const createData = async (req, res) => {
    const { title, image, body, published, user } = res
    // let published_at = res.published_at

    try{

        let slug = await generateSlug(title)

        const createPost = await prisma.post.create({
            data: {
                title, image, body, slug, published, user_id : user.id
            },
        });

        if(!createPost){
            throw new Error("Error Create")
        }

        return res.status(200).json({
            message: "L'article a été créé avec succès.",
            createPost: createPost
        })

    } catch(e){
        let error = "Une erreur c'est produite."
        let code = 500

        if(e == "Error Create"){
            error = "Une erreur c'est produite lors de la création de l'article."
        }

        console.log(e);

        return res.status(code).json({
            error
        })
    }
}

export const showData = async (req, res) => {
    const slug = req.params.slug
    const id = req.params.id

    try{

        let showPost = ""
        
        if(slug){
            showPost = await prisma.post.findFirst({
                where: {
                  slug: slug
                },
                include: {
                    user: true
                }
            })
        } else {
            showPost = await prisma.post.findFirst({
                where: {
                  id: parseInt(id)
                },
                include: {
                    user: true
                }
              })
        }

        if(!showPost){
            throw new Error("Error Posts")
        }

        return res.json({
            showPost
        })

    } catch(e){
        let error = "Une erreur c'est produite."
        let code = 500

        if(e == "Error Posts"){
            error = "Il n'y a aucun articles."
        }

        console.log(e);

        return res.status(code).json({
            error
        })
    }
}

export const updateData = async(req, res) => {
    const { title, image, body, published } = res
    const id = req.params.id

    try{
        const updatePost = await prisma.post.update({ 
            where: {
                id: parseInt(id)
            },
            data: { 
                title, image, body, published
            },
            include: {
                user: true
            }
        })

        if(!updatePost){
            throw new Error("Error Update")
        }

        return res.json({
            message: "L'article a été modifié avec succès.",
            updatePost
        })

    } catch(e){
        let error = "Une erreur c'est produite."
        let code = 500

        if(e == "Error Update"){
            error = "Une erreur c'est produite lors de la modification de l'article."
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
        const deletePost = await prisma.post.delete({ 
            where: {
                id: parseInt(id)
            }
        })

        if(!deletePost){
            throw new Error("Error Delete")
        }

        res.json({
            message: "L'article a été supprimé avec succès.",
            deletePost
        })

    } catch(e){
        let error = "Une erreur c'est produite."
        let code = 500

        if(e == "Error Delete"){
            error = "Une erreur c'est produite lors de la suppression de l'article."
        }

        res.status(code).json({
            error
        })
    }
}

export const searchData = async(req, res) => {
    const q = req.query.q
    
    console.log(q);

    try{
        const searchPosts = await prisma.post.findMany({
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
            searchpost: searchPosts
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

      let slugExist = await prisma.post.findFirst({
            where: {
              slug: slug,
            },
          });
      let slugNb = 1;
      let slugGenerate = slug;

        while (slugExist) {
          slugGenerate = `${slug}-${slugNb}`;
          slugNb++;

          slugExist = await prisma.post.findFirst({
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

  