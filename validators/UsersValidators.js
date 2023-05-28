export const emailValidator = (email, verifEmail = false) => {

    // regex
    const emailRegex = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/
    let emailError = ""
    let verifEmailError = ""
    let validate = true

    if(!emailRegex.test(email)){
        validate = false
        emailError = "Veuillez saisir un email valide."
    }

   if(verifEmail && email != verifEmail){
        validate = false
        verifEmailError = "Les deux email doivent être identique."
    }

    return { validate, emailError, verifEmailError}
}

export const passwordValidator = (password, verifPassword = false) => {

    // regex
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,20}$/;
    let passwordError = "" 
    let verifPasswordError = ""
    let validate = true

    if(!passwordRegex.test(password)){
        validate = false
        passwordError = "Veuillez saisir un mot de passe valide ( entre 8 et 20 caractères, au moins un chiffre, au moins une majuscule et une miniscule )"
    }

    if(verifPassword && password != verifPassword){
        validate = false
        verifPasswordError = "Les deux mots de passe doivent être identique"
    }

    return {validate, passwordError, verifPasswordError}
}

export const champValidator = (champ, errorMessage, type = "text") => {
    let message = ""

    if(type == "email"){
        let message = (champ && champ.trim() == "") ??  errorMessage
        
        if(!emailValidator(email).validate){
        errors = true
        emailError = emailValidator(email).emailError
         }

        return !message ?? emailValidator(email).emailError

    } else if(type == "password"){
        return message = (champ && champ.trim() == "") ??  errorMessage
    }

    return message = (champ && champ.trim() == "") ??  errorMessage
}