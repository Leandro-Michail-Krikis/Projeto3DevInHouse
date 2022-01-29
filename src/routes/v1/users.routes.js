const express = require('express')
const usersRoutes = express.Router()
const userController = require('../../controllers/userController')

usersRoutes.get('/user/:id', userController.getUser)
usersRoutes.post('/user/', userController.createUser)
usersRoutes.patch('/user/:id', userController.updateUser)

module.exports = usersRoutes
