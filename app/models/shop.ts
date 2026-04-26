import mongoose from "mongoose";

const ShopSchema = new mongoose.Schema( {
    title: { type: String, required: true },
    link: String,
    prompt: String,
}, {
    timestamps: true
} );

export default mongoose.models.Shop ||
    mongoose.model( "Shop", ShopSchema );