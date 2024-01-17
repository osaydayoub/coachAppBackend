import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import {errorHandler} from "./middlewares/errorMiddleware.js";
import userRoutes from "./routes/userRoutes.js"

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1/users", userRoutes);
// app.use("/api/v1/coach/clients",clientsRoutes);
// app.use("/api/v1/coach/workout",workoutRoutes);
// app.use("/api/v1/coach/meals",mealsRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
  });
});
