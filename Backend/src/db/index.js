import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async ()=>{
     try {
      // If MONGODB_URI already contains a database name (e.g. mongodb+srv://.../mydb)
      // avoid appending DB_NAME which would create an invalid namespace like 'mydb/otherdb.collection'
      const uri = process.env.MONGODB_URI;
      let connectionString;
      if (!uri) throw new Error('MONGODB_URI is not defined in environment');

      // simple heuristic: when split('/') length >= 4 the URI already has a database path
      // e.g. ['mongodb+srv:', '', 'user:pass@host', 'dbname'] -> length 4
      if (uri.split('/').length >= 4) {
        connectionString = uri;
      } else {
        connectionString = `${uri}/${DB_NAME}`;
      }

      const connectionInstance = await mongoose.connect(connectionString);
       console.log(`\n MongoDB connected !! DB Host: ${connectionInstance.connection.host}`)
     }  
     catch(error){
        console.log("Mongo DB connection error: ",error);
        process.exit(1);
     } 
}


export default connectDB