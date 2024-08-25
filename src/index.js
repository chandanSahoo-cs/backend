import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
    path : './env'
})

connectDB()
.then(()=>{
    app.on("error",(err)=>{
        console.log("Error",err);
    })
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is a running at port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    comsole.error("MONGO DB connection failed",err)
})






















// import express from "express"
// const app = express();
// ;(async()=>{
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}`)
//         app.on("error",(error)=>{
//             console.error("ERROR: ",error)
//             throw error
//         })
//         app.listen(proces.env.PORT)
//     }
//     catch(error){
//         console.error("ERROR: ",error)
//     }
// })()