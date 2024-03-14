import mongoose, { Schema, Document, Model, model, Mongoose, ObjectId }   from "mongoose";

export type MongooseDecimal128 = mongoose.Types.Decimal128;
export type MongooseObjectId = mongoose.Types.ObjectId;
export type MongooseUpdateOptions = { new: boolean; upsert: boolean };

export { Schema, Document, Model, model, Mongoose, ObjectId }