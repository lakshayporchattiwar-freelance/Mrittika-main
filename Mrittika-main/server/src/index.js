import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { corsOrigins, env } from "./config.js";
import healthRoutes from "./routes/health.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import paymentRoutes from "./routes/payments.js";
import newsletterRoutes from "./routes/newsletter.js";
import adminRoutes from "./routes/admin.js";

const app = express();

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("tiny"));

app.use("/health", healthRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/payments", paymentRoutes);
app.use("/newsletter", newsletterRoutes);
app.use("/admin", adminRoutes);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Server error" });
});

app.listen(Number(env.PORT), () => {
  console.log(`API running on port ${env.PORT}`);
});
