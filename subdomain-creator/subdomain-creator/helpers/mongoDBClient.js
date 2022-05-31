require('dotenv').config();
const { MongoClient } = require('mongodb');
let subdomainCollection;
let subdomainReposCollection;
let subdomainScriptsCollection;
let mongoClient;

export async function getSubdomainCollection() {
    if(!subdomainCollection) {
        mongoClient = new MongoClient(process.env.MONGODB_URL);
        await mongoClient.connect();
        const database = mongoClient.db(process.env.MONGODB_DB);
        subdomainCollection = database.collection(process.env.MONGODB_SUBDOMAIN_COLLECTION);
    }
    return subdomainCollection;
}

export async function getSubdomainReposCollection() {
    if(!subdomainReposCollection) {
        mongoClient = new MongoClient(process.env.MONGODB_URL);
        await mongoClient.connect();
        const database = mongoClient.db(process.env.MONGODB_DB);
        subdomainReposCollection = database.collection(process.env.MONGODB_SUBDOMAIN_REPOS_COLLECTION);
    }
    return subdomainReposCollection;
}

export async function getSubdomainScriptsCollection() {
    if(!subdomainScriptsCollection) {
        mongoClient = new MongoClient(process.env.MONGODB_URL);
        await mongoClient.connect();
        const database = mongoClient.db(process.env.MONGODB_DB);
        subdomainScriptsCollection = database.collection(process.env.MONGODB_SUBDOMAIN_SCRIPTS_COLLECTION);
    }
    return subdomainScriptsCollection;
}

export async function closeConnection() {
    if(mongoClient) {
        await mongoClient.close();
        subdomainCollection = null;
        subdomainReposCollection = null;
        subdomainScriptsCollection = null;
    }
}