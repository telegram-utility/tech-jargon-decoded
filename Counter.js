const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    }
    ,index:{
        type:Number,
        default:0
    }
})

const Counter = mongoose.model("Counter",counterSchema);

module.exports= {Counter};
