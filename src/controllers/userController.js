const res = require('express/lib/response')
const { getData, createOrUpdateData } = require('../utils/functions')
const userService = require('../services/user.service')
const defaultValuesOfUser = ['name', 'email']
module.exports = {
    
    async getUser(req, res){
        const { id } = req.params
        try{
            const response = await userService.getUserById(id)
            return res.status(200).json(response)
        } catch (error) {
            console.log(error.message)
            return res.status(400).json({error: error.message})
        }
    },
    async createUser(req, res){
        const { name, email }  = req.body
        let errorMessage = 'É necessario enviar o(s) seguinte(s) dados: '
        let emptyValue = false
        if(!name){
            errorMessage += 'Nome '
            emptyValue = true
        }
        if(!email){
            errorMessage += 'Email '
            emptyValue = true
        }
        if(emptyValue){
            return res.status(400).send(
                {message: errorMessage}
            )
        }
        const users = getData('user.json')
        const createNewUser = [
            ...users, {
                id: users.length + 1,
                name: name,
                email: email
            }
        ]
        createOrUpdateData('user.json', createNewUser)
        return res.status(201).send({message: 'Usuario salvo com sucesso'})
    },
    async updateUser(req, res){
        const { id } = req.params
        const users = getData('user.json')
        const user = users.find((user) => user.id === Number(id))
        const newUserData = req.body
        let invalidData = false
        Object.keys(req.body).forEach(element =>{
            if(defaultValuesOfUser.indexOf(element) == -1){
              invalidData = true
            }
        })
        if(invalidData){
            return res.status(400).send({message:'Dados invalidos foram enviados'})
        }
        if(!user){
            return res.status(200).send({message:"Esse usuario não existe"})
        }
        const updateUser = users.map((user)=>{
            if(user.id === Number(id)){
                return {...user, ...newUserData}
            }
            else{
                return {...user}
            }
        })
        createOrUpdateData('user.json', updateUser)
        return res.status(200).send({message:"Usuario alterado com sucesso"})
    }
}