import express from "express";
const app = express();
app.get("/",(req, res) => {
    res.send("Server is now ready");
});
app.listen(5001, () => {
    console.log("Server started at http://localhost:5001");
});