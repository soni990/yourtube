import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({

    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:true
    },

    plan:{
        type:String,
        required:true
    },

    amount:{
        type:Number,
        required:true
    },

    paymentId:{
        type:String,
        required:true
    },

    orderId:{
        type:String
    },

    status:{
        type:String,
        default:"success"
    },

    purchasedAt:{
        type:Date,
        default:Date.now
    }

});


export default mongoose.model(
    "subscriptions",
    subscriptionSchema
);