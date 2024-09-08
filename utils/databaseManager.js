// Database Manager
const schemafiles = "./mongoSchemas/";

const database = {
    Users: loadSchema("Users"),
    Clients: loadSchema("Clients"),
    Projects: loadSchema("Projects"),
    Tickets: loadSchema('Tickets'),
    Sessions: loadSchema("Sessions")
}

module.exports = database;

function loadSchema(filename) {
    console.debug(`Loading schema: ${filename}`);
    try {
        const returnData = require(`${schemafiles}${filename}.js`);
        console.log(returnData)
        return returnData
    } catch (e) {
        console.error(`Error loading schema: ${filename}`);
        console.error(e);
        return null;
    }
}

