import mongoose from "mongoose";

export const ProductSchema = new mongoose.Schema( {
    name: String,
    price: String,
    old_price: String,
    link: String,
    image: String,
    shop: mongoose.Types.ObjectId,
    commission: Number,
}, {
    timestamps: true
} );

export default mongoose.models.Discount ||
    mongoose.model( "Discount", ProductSchema );