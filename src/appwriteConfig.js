import { Client, Account, Databases } from "appwrite";

const client = new Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.REACT_APP_APPWRITE_PROJECT_ID);

const account = new Account(client);
const db = new Databases(client);
export { account, db };
