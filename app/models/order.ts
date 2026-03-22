import mongoose, { Schema } from "mongoose";

const OrderSchema = new mongoose.Schema( {
    sale: {
        type: Schema.Types.ObjectId,
        required: true
    },
    customerInfo: {
        fullName: { type: String, required: true },
        address: { type: String, required: true },
        delivery: { type: String, required: true },
        phone: { type: String, required: true },
        comment: { type: String, required: true }
    },
    items: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Discount',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            price: {
                type: Number,
                required: true
            }
        } ],
    totalCost: { type: Number, required: true },
}, {
    timestamps: true
} );

export default mongoose.models.Order ||
    mongoose.model( "Order", OrderSchema );