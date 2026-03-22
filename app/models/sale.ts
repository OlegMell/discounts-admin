import mongoose, { Schema } from "mongoose";

const SaleSchema = new mongoose.Schema( {
    shop: {
        type: Schema.Types.ObjectId,
        ref: "Shop",
        required: true
    },
    minCartCost: { type: Number, required: true },
    commission: { type: Number, required: true },
    products: [
        {
            type: Schema.Types.ObjectId,
            ref: "Discount",
            required: true
        }
    ],
    currency: { type: String, required: true },
}, {
    timestamps: true
} );

export default mongoose.models.Sale ||
    mongoose.model( "Sale", SaleSchema );