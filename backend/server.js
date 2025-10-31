import express from "express";
const app = express();
app.get("/products",(req, res) => {});
app.listen(5001, () => {
    console.log("Server started at http://localhost:5001");
});

import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db.js"; // make sure it is db.js
connectDB();