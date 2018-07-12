const { Client } = require('pg');

const conStr = 'postgres://loginAdmin:babyDestination@logindb.cgtssx1hr0bo.ap-south-1.rds.amazonaws.com:5432/loginDetails';

const client = new Client (conStr);
async function connection() {
    await client.connect();
}

connection();

module.exports = client;