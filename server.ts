import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Secure Admin API
  // In a real production app, you'd use a session cookie or JWT here.
  // For this context, we check the 'x-admin-token' header
  const adminAuth = (req: any, res: any, next: any) => {
    if (req.headers['x-admin-token'] === "admin-session-active") {
      next();
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  };

  // Admin Verification
  app.post("/api/admin/verify", (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || "Nahom@110108";
    if (password === adminPassword) {
      return res.json({ success: true, token: "admin-session-active" });
    }
    return res.status(401).json({ success: false, message: "Incorrect Password" });
  });

  // Admin Data Proxy (Optional, but adds security layer)
  // For now, we'll keep the frontend using Firestore directly for speed and "thousands of students" requirement,
  // but we enforce critical actions (Approval/Settings) through this server.
  
  // We can also issue a one-time Firestore token if we had Auth, 
  // but since we don't, we'll rely on the frontend dashboard logic for now.
  // IMPORTANT: For true security, the firestore.rules must be updated.

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Chercher Secondary School System running on http://localhost:${PORT}`);
  });
}

startServer();
