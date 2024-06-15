import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express()
app.use(cors({
    origin:process.env.ORIGIN,
    credentials:true
}))
app.use(express.json({limit:"15kb"}))
app.use(express.urlencoded({extended:true,limit:"15kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//import routers
import router from "./routes/user.route.js"
//routers declaration
app.use("/api/v1/users", router)

export {app}