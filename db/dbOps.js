const { Client } = require('pg');

const conStr = 'postgres://loginAdmin@logindb:babyDestination1@logindb.postgres.database.azure.com:5432/logindetails';

const client = new Client (conStr);
async function connection() {
    await client.connect();
}

connection();

module.exports = client;