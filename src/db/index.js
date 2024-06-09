import mongoose from "mongoose";
const DBConnection = async()=>{
    try {
        const mongodbConnectionInstance = await mongoose.connect(process.env.CONNECTION_URL)
        console.log(`moongo db connect: connect at ${mongodbConnectionInstance.connection.host}`);       
    } catch (error) {
        console.log("connection error",error);
        process.exit(1)
    }
}
export default DBConnection