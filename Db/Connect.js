import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const url = process.env.MONGODB_URL;
const client = new MongoClient(url);

export const connetDB = async () => {
  try {
    await client.connect();
    const db = client.db("Yummy_Go"); // Database name
    // All collection
    const usersCollection = db.collection("users");
    console.log("MongoDb connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
};

// Getter functions for collections
export const getDB = () => db;
export const getUsersCollection = () => usersCollection;