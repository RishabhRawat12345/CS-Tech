const mongoose=require("mongoose");

const database=async()=>{

    mongoose.connect(process.env.Mongo_Url,{
     useNewUrlParser: true,
    useUnifiedTopology: true
    }).then(()=>console.log("Mongo db is successfully connected"))
    .catch((err)=>console.log("some error is generated",err))
}

module.exports=database;