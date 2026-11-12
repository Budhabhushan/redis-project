import express from "express";
import Redis from "ioredis";
import mongoose from "mongoose";
import { Queue } from "bullmq";
import { emailQueue } from "./queue.js";

const app = express();
app.use(express.json());

// const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const subscriber = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const publisher = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

subscriber.subscribe("notificatios", (err) => {
  if (err) {
    console.log("Failed to sunscriber: %s", err.message);
    return;
  }
  console.log("Subscriberd Successfully");
});

subscriber.on("message", (channel, message) => {
  console.log("Recevied on", channel, ":", JSON.parse(message));
});

app.post("/notifications", async (req, res) => {
  const payload = {
    title: req.body.title || "Default Title",
    createdAt: new Date().toISOString(),
  };
  const receivers = await publisher.publish(
    "notifications",
    JSON.stringify(payload),
  );
  res.json({ message: `Notification sent to ${receivers} subscribers` });
});
// const BANNER_KEY = "app:banner";

// app.get("/redis", async (req, res) => {
//   const reply = await redis.ping();
//   res.json({ redis: reply });
// });

// app.get("/mongo", async (req, res) => {
//   const url = process.env.MONGO_URL || "mongodb://localhost:27017/redis-mongo";
//   if (mongoose.connection.readyState === 0) {
//     await mongoose.connect(url);
//   }
//   res.json({ mongo: "connected", database: mongoose.connection.name });
// });

// app.post("/banner", async (req, res) => {
//   const message = req.body?.message || "Welcome to redis practice";
//   console.log(message);
//   await redis.set(BANNER_KEY, message);
//   res.json({ success: true });
// });

// app.get("/banner", async (req, res) => {
//   const message = await redis.get(BANNER_KEY);
//   res.json({ message });
// });

// app.delete("/banner", async (req, res) => {
//   await redis.del(BANNER_KEY);
//   res.json({ success: true });
// });

// app.get("/banner/exists", async (req, res) => {
//   const exists = await redis.exists(BANNER_KEY);
//   res.json({ exists: Boolean(exists) });
// });

// function otpKey(phone) {
//   return `otp:${phone}`;
// }
// app.post("/otp", async (req, res) => {
//   const { phone } = req.body;
//   const otp = Math.floor(100000 + Math.random() * 900000).toString();
//   await redis.set(otpKey(phone), otp, "EX", 30);
//   res.json({ message: "OTP sent", otp });
// });

// app.get("/otp/verfiy", async (req, res) => {
//   const { phone, otp } = req.body;
//   const savedOtp = await redis.get(otpKey(phone));
//   if (!savedOtp) {
//     return res.status(400).json({ message: "OTP expired or not found" });
//   }
//   if (savedOtp !== otp) {
//     return res.status(400).json({ message: "Invalid OTP" });
//   }
//   await redis.del(otpKey(phone));
//   res.json({ message: "OTP verified successfully" });
// });

// app.get("/otp/:phone/ttl", async (req, res) => {
//   const ttl = await redis.ttl(otpKey(req.params.phone));
//   res.json({ ttl });
// });

// app.post("/welcome-email", async (req, res) => {
//   const job = emailQueue.add(
//     "send-welcome-email",
//     {
//       to: req.body.to,
//       name: req.body.name || "Larner",
//     },
//     {
//       attempts: 3,
//       backoff: {
//         type: "exponential",
//         delay: 1000,
//       },
//     },
//   );
//   res.json({ message: "Welcome email job added to the queue!", jobId: job.id });
// });

app.listen(3400, () => {
  console.log("Server is running on port 3400");
});
