const express = require('express')
const financialRoutes = express.Router()
const financialController = require('../../controllers/financialController')
const multer = require('multer')
const upload = multer()


financialRoutes.get('/financial/:userId', financialController.getFinancial)
financialRoutes.post('/financial/:id', upload.single('file'), financialController.createFinancial)
financialRoutes.delete('/financial/:userId/:financialId', financialController.deleteFinancial)
module.exports = financialRoutes
