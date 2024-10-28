// Database Manager
const schemafiles = "./mongoSchemas/";

const database = {
    Users: loadSchema("Users"),
    Clients: loadSchema("Clients"),
    Projects: loadSchema("Projects"),
    Tickets: loadSchema('Tickets'),
    Groups: loadSchema('Groups'),
    Permissions: loadSchema('Permissions')
}


module.exports = database;

function loadSchema(filename) {
    try {
        return require(`${schemafiles}${filename}.js`)
    } catch (e) {
        console.error(`Error loading schema: ${filename}`);
        console.error(e);
        return null;
    }
}
