import { Router } from "express";

const router = Router();

/*
 * HEALTH CHECK ROUTE — Keep backend awake on free hosting plans
 *
 * After deploying to Render/Railway, set up UptimeRobot to ping this route:
 *
 * 1. Go to https://uptimerobot.com and create a free account
 * 2. Click "+ Add New Monitor"
 * 3. Set Monitor Type to: HTTP(s)
 * 4. Set Friendly Name to: Mrittika Backend
 * 5. Set URL to: https://<your-render-service>.onrender.com/health
 *    (find the exact URL on your Render service page)
 * 6. Set Monitoring Interval to: 5 Minutes
 * 7. Click Create Monitor
 *
 * Test it locally first: GET http://localhost:4000/health
 * Expected response: { "success": true, "message": "Server is healthy", "timestamp": "..." }
 */
router.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

export default router;
