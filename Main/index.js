import express from "express";
import { connetDB } from "../Db/Connect.js";
import userRouter from "../Routes/User.Router.js";

const app = express();
app.use(express.json());

//Routes
app.use("/api/users", userRouter);

const startServer = async () => {
  await connetDB();
  app.listen(500, () => {
    console.log("Server running on port 5000");
  });
};

startServer();
