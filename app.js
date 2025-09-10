import express from "express";
import connectDB from "./db/connect.js";
import "dotenv/config";
import "express-async-errors";
import fileUpload from "express-fileupload";
import { v2 as cloudinary } from "cloudinary";
import cookieParser from "cookie-parser";

//routers
import tasksRouter from "./routers/tasksRouter.js";
import authRouter from "./routers/authRouter.js";
import userRouter from "./routers/userRouter.js";

// middleware
import { authentication } from "./middleware/authentication.js";
import notFoundMiddleware from "./middleware/not-found.js";
import errorHandlerMiddleware from "./middleware/error-handler.js";

// extra security packages
import helmet from "helmet";
import cors from "cors";
import { xss } from "express-xss-sanitizer";
import { rateLimit } from "express-rate-limit";

const app = express();
const port = process.env.PORT || 5001;

// rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
  })
);
app.use(express.static("./public"));
// app.use("/uploads", express.static('uploads'))
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.urlencoded({ extended: false }));
app.use(xss());
//XSS-Schutz ist eine Sicherheitsmaßnahme, die darauf abzielt, Cross-Site-Scripting-Angriffe zu verhindern, indem sie bösartigen Code aus Benutzereingaben entfernt.

//Helmet hilft, Express-Apps durch das Festlegen von HTTP-Antwortheadern zu sichern.
app.use(helmet());

//CORS ist ein Mechanismus, der es Webbrowsern ermöglicht, Ressourcen von einer anderen Domäne als der Ursprungsdomäne anzufordern.
app.use(
  cors({
    origin: import.meta.env.FRONTEND_URL, // your frontend URL
    credentials: true,
  })
);

// file upload
app.use(fileUpload());
//for cloudinary add { useTempFiles: true }

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
//Routes

app.use("/api/v1/auth", authRouter);

app.use("/api/v1/tasks", authentication, tasksRouter);

app.use("/api/v1/users", userRouter);
app.use("/api/v1", (req, res) => {
  console.log(req.signedCookies);
  res.send("Task Manager");
});
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("connected to DB");

    app.listen(port, () => {
      console.log(`the server is listening on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
