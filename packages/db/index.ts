import mongoose from "mongoose";

export const Worksapce = new mongoose.Schema({
    path: String,
    name: String
})

export const Session = new mongoose.Schema({
    conversation: [Object],
    worksapceId: [{type: mongoose.Schema.Types.ObjectId, ref: "Worksapce"}]
})
