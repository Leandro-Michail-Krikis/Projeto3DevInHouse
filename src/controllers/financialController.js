const res = require('express/lib/response')
const xlsxPopulate = require('xlsx-populate')
const { getData, createOrUpdateData, missingDefaultValues, notDefaultValues } = require('../utils/functions')
const defaultValuesOfFinancial = ['price', 'typesOfExpenses', 'date', 'name']
const {yearConstructor, monthYearConstructor} = require('../services/financial.service')
module.exports = {
    async getFinancial(req, res) {
        const { userId } = req.params
        const {typesOfExpenses} = req.query
        const userDataBase = getData('user.json')
        const financialDataBase = getData('financial.json')
        let errorMessage = ''
        let error = false
        let jsonResponse 
        let yearsTemp = []
        let monthsYearTemp = {}
    
        const existsUser = userDataBase.find(user => user.id === Number(userId))
        if(!existsUser){
            errorMessage += ' Não a usuario com esse id.'
            error = true
        }
        let financialDataOfUser = financialDataBase.find(financial => financial.userId === Number(userId))
        if(!financialDataOfUser){
            errorMessage += ' Não a financial data para esse usuario'
            error = true
        }

        if(error){
            return res.status(204).json({ message: errorMessage })
        }

        yearConstructor(financialDataOfUser, yearsTemp)

        monthYearConstructor(financialDataOfUser, yearsTemp, monthsYearTemp) 

        

        const jsonResponseConstructor = (data, monthsYear) =>{
            jsonResponse = monthsYear
            for (let [keyFather, valueFather] of Object.entries(monthsYear)){
                for(let [keyChild, valueChild] of Object.entries(valueFather)){
                    let tempValue = 0
                    data.financialData.forEach(object => {
                        let monthTemp = object.date.substring(3, 5)
                        let keyChildTemp = keyChild.substring(4, 6)
                        let yearTemp = object.date.substring(6, 10)
                        let typesOfExpensesTemp = object.typesOfExpenses
                        if(typesOfExpenses){
                            if(yearTemp === keyFather && monthTemp === keyChildTemp && typesOfExpenses === typesOfExpensesTemp){
                            tempValue += object.price
                            }  
                        } else{
                          if(yearTemp === keyFather && monthTemp === keyChildTemp){
                            tempValue += object.price
                            }  
                        }



                        
                    })
                    jsonResponse[keyFather][keyChild] = tempValue
                } 
                
            }
            
        }
        jsonResponseConstructor(financialDataOfUser, monthsYearTemp)
        
        return res.status(200).send( jsonResponse )
    
    },
    

    async createFinancial(req, res) {
        try {
            const { id } = req.params
            const userDataBase = getData('user.json')
            let financialDataBase = getData('financial.json')
            const xlsxBuffer = req.file.buffer
            const xlsxData = await xlsxPopulate.fromDataAsync(xlsxBuffer)
            const rows = xlsxData.sheet(0).usedRange().value()
            let errorMessage = ''
            let error = false




            let [firstRow, ...newFinancialData] = rows
            if(missingDefaultValues(firstRow, defaultValuesOfFinancial).length){
                errorMessage += ` Estão faltando esses dados ${missingDefaultValues(firstRow, defaultValuesOfFinancial)}.`
                error = true 
            }
            if(notDefaultValues(firstRow, defaultValuesOfFinancial).length){
                errorMessage += ` Esses dados são desnecessários ${notDefaultValues(firstRow, defaultValuesOfFinancial)}.`
                error = true
            }
            if(error){
                return res.status(400).json({ message: errorMessage })
            }   
            

            const existUser = userDataBase.find(user => user.id === Number(id))
            if (!existUser) {
                return res.status(400).json({ message: 'Usuario invalido' })
            }


            newFinancialData = newFinancialData.reduce((previousValue, currentValue) =>
                        ([...previousValue, currentValue.reduce((preVa, cuVa, cuIn)=>
                         ({...preVa, [defaultValuesOfFinancial[cuIn]]:cuVa}),{})
                    ]),[])
            const existsFinancial = financialDataBase.find(financial => financial.userId === Number(id))
               
            
            if(!existsFinancial) {
                financialDataBase = [
                    ...financialDataBase, {
                        id: financialDataBase.length + 1,
                        userId: Number(id),
                        financialData:[
                            ...newFinancialData.map((element ,index) =>{
                                return {id:index, ...element}
                            })
                        ]
                    }
                ]
            } else {
                financialDataBase.map((object)=> {
                    if(object.userId === Number(id)){
                        index = object.financialData.length
                        newData = newFinancialData.map((element) =>{
                                index++
                                return {id:index, ...element}
                            })
                        object.financialData = [...object.financialData, ...newData]
                    } else {
                        return object
                    }

                })
            }
             
            
            createOrUpdateData('financial.json', financialDataBase)
            return res.status(200).json({ message: 'funcionou' })
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: 'E necessario mandar um arquivo' })
        }
    },
    async deleteFinancial(req, res) {
        const { userId, financialId } = req.params
        const userDataBase = getData('user.json')
        let financialDataBase = getData('financial.json')
        let errorMessage = ''
        let error = false

        const existsUser = userDataBase.find(user => user.id === Number(userId))
        if(!existsUser){
            errorMessage += ' Não a usuario com esse id.'
            error = true
        }
        const existsFinancial = financialDataBase.find(financial => financial.id === Number(financialId))
        if(!existsFinancial){
            errorMessage += ' Não a financial data com esse id.'
            error = true
        }
        if(error){
            return res.status(400).json({ message: errorMessage })
        }
        financialDataBase = financialDataBase.filter(object => object.id !== Number(financialId))    
        createOrUpdateData('financial.json', financialDataBase)
        return res.status(200).json({ message: 'Financial data apagada com sucesso' })
    }
}