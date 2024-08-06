import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import routes from "./routes/index.js";
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(cors({ origin: "*" }));
const port = parseInt(process.env.PORT || "8000");
app.use("/api", routes);
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
