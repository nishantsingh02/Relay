import mongoose from "mongoose";

export const Workspace = new mongoose.Schema({
    path: { type: String, required: true, unique: true },
    name: { type: String, required: true },
}, { timestamps: true });

// export const Message = new mongoose.Schema({
//     role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
//     content: { type: String, required: true },
//     timestamp: { type: Date, default: Date.now }
// });

export const Session = new mongoose.Schema({
    conversation: [Object],
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
}, { timestamps: true });

Workspace.index({ path: 1 });
Session.index({ workspaceId: 1, createdAt: -1 });

export const WorkspaceModel = mongoose.model("Workspace", Workspace);
export const SessionModel = mongoose.model("Session", Session);


// import mongoose from "mongoose";

// export const Workspace = new mongoose.Schema({
//     path: String,
//     name: String
// })

// export const Session = new mongoose.Schema({
//     conversation: [Object],
//     worksapceId: [{type: mongoose.Schema.Types.ObjectId, ref: "Worksapce"}]
// })

// export const WorkspaceModel = mongoose.model("Workspace", Workspace);
// export const SessionModel = mongoose.model("Session", Session);

