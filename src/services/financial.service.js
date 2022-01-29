module.exports = {
   async yearConstructor(data, years){
            for (let index = 0; index < data.financialData.length; index++) {
                let year = data.financialData[index].date.substring(6, 10)
                if(!years.find(element => element === year)){
                    years.push(year)
                }
            }
            years.sort()
            return years 
        },
    async monthYearConstructor(data, years, monthsYearTemp){
                let monthsToAdd = []
                years.forEach(year => {
                    monthsToAdd = []
                    monthsYearTemp[year] = {}

                    data.financialData.forEach(object => {
                        if(object.date.substring(6, 10) === year){
                            let month = object.date.substring(3, 5)
                            if(!monthsToAdd.find(element => element === month)){
                                monthsToAdd.push(month)
                            }
                        }
                    }) 
                    
                    monthsToAdd.forEach(month => {
                        monthsYearTemp[year][`Mês_${month}`] = null
                    })
                    
                })

        }
}