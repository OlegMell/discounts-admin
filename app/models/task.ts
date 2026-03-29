import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema( {
    status: { type: String, enum: [ 'pending', 'processing', 'done', 'error' ] },
    progress: { type: Number, min: 0, max: 100 },
    result: { type: Object },
    error: { type: String, nullable: true },
}, {
    timestamps: true
} );

export default mongoose.models.Task ||
    mongoose.model( "Task", TaskSchema );