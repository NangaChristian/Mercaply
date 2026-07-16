import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Initialize Supabase backend client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';


const isValidUrl = (url: string) => {
  if (!url) return false;
  try {
    new URL(url);
    return url.startsWith('http');
  } catch (e) {
    return false;
  }
};

export const supabase = (supabaseUrl && supabaseKey && isValidUrl(supabaseUrl))
  ? createClient(supabaseUrl, supabaseKey)
  : null;


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", supabase: !!supabase });
  });

  // Example API route
  app.get("/api/data", async (req, res) => {
    if (!supabase) {
      return res.status(500).json({ error: "Supabase not configured" });
    }
    // const { data, error } = await supabase.from('your_table').select('*');
    res.json({ message: "Backend is connected" });
  });

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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
