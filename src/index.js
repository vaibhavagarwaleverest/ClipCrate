import path from "path"
import dotenv from "dotenv"
import { fileURLToPath } from 'url';
import ConnectDB from "./db/index.js"
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename);
dotenv.config({ path:  path.resolve(__dirname, './.env')})
console.log(process.env.PORT)

ConnectDB()