const fileSystem = require('fs');

function getData(fileName){
    const result = JSON.parse(fileSystem.readFileSync('src/database/'+fileName, 'utf8'));
    return result
}

function createOrUpdateData(fileName, data){
    fileSystem.writeFileSync('src/database/'+ fileName, JSON.stringify(data));
}

const missingDefaultValues = (array, defaultValues) =>{
            return defaultValues.filter(string => !array.includes(string))
        }

const notDefaultValues = (array, defaultValues) =>{
            return array.filter(string => !defaultValues.includes(string))
        }
module.exports = {
    getData,
    createOrUpdateData,
    missingDefaultValues,
    notDefaultValues
}