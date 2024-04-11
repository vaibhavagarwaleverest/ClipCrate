import mongoose from "mongoose";
import DB_NAME from "../constants.js";


const ConnectDB= async ()=>
{
    try
    {
        console.log(`${process.env.MONGODB_URI}`);
        console.log(`${DB_NAME}`)
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log("MongDB Database Connected Successfully")
        console.log(connectionInstance.connection.host);

    }
    catch(error)
    {
        console.log("MongoDb Connectio Failed",error);
        process.exit(1);

    }
}
export default ConnectDB
