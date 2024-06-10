import dotenv from "dotenv"
import DBConnection from "./db/index.js"
import { app } from "./app.js"

dotenv.config({
    path: './.env'
})

DBConnection()
.then(()=>{
        app.listen(process.env.PORT || 8000,()=>{
            console.log(`server is running at port : ${process.env.PORT}`);
        })
    }
)
.catch((err)=>{
        console.log("db connection failed..!",err);
    }
)