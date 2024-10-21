import client from "../db.js";

// Function to create the 'company' table
const createCompanyTable = async () => {
    const query = `
        DROP TABLE IF EXISTS company;
        CREATE TABLE IF NOT EXISTS company (
            name VARCHAR(100) NOT NULL,
            symbol VARCHAR(10) NOT NULL PRIMARY KEY,
            location VARCHAR(100) NOT NULL,
            founded INT NOT NULL
        );
    `;
    const addRecord = `
    INSERT INTO company (name, symbol, location, founded)
VALUES
    ('Apple Inc.', 'AAPL', 'Cupertino, CA', 1976),
    ('Microsoft Corporation', 'MSFT', 'Redmond, WA', 1975),
    ('Amazon.com, Inc.', 'AMZN', 'Seattle, WA', 1994),
    ('Alphabet Inc.', 'GOOGL', 'Mountain View, CA', 1998),
    ('Tesla, Inc.', 'TSLA', 'Palo Alto, CA', 2003);
    `
    const getRecord = `
        SELECT * FROM company;
    `

    try {
        // Execute the query to create the table
        await client.query(query);
        await client.query(addRecord);
        let records = await client.query({
            rowMode: 'array',
            text:getRecord
        });
        console.log(records.rows)
        console.log('Company table has been created');
    } catch (err) {
        console.error('Error creating company table:', err);
    } finally {
        // Close the pool after the table creation
        client.end();
    }
};

createCompanyTable();