import { Router } from "express";
import { supabaseAdmin } from "../supabase.js";
import { getConfig, saveConfig } from "../services/config.js";

const router = Router();

// Middleware to check if user is admin
// (Assuming the frontend passes the user ID or a JWT we can verify, 
// for simplicity in this example we might trust a header or verify the JWT using supabaseAdmin)
const requireAdmin = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: "Invalid token" });

  const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return res.status(403).json({ error: "Forbidden: Admins only" });

  req.user = user;
  next();
};

router.use(requireAdmin);

// Get all users
router.get("/users", async (req, res) => {
  if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });
  
  // We need auth users and profiles.
  // Using supabaseAdmin auth.admin.listUsers() 
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
  if (authError) return res.status(500).json({ error: authError.message });
  
  const { data: profiles, error: profError } = await supabaseAdmin.from('profiles').select('*');
  if (profError) return res.status(500).json({ error: profError.message });

  const users = authData.users.map(u => {
    const p = profiles.find(pr => pr.id === u.id) || {};
    return {
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      role: p.role || 'buyer',
      status: p.status || 'active',
      is_banned: p.is_banned || false,
      first_name: p.first_name,
      last_name: p.last_name
    };
  });
  
  res.json(users);
});

// Update user role
router.patch("/users/:id/role", async (req, res) => {
  if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });
  const { role } = req.body;
  if (!['admin', 'seller', 'buyer'].includes(role)) return res.status(400).json({ error: "Invalid role" });
  
  const { error } = await supabaseAdmin.from('profiles').update({ role }).eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Toggle ban status
router.patch("/users/:id/ban", async (req, res) => {
  if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });
  const { is_banned } = req.body;
  const { error } = await supabaseAdmin.from('profiles').update({ is_banned }).eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Toggle status (active/disabled)
router.patch("/users/:id/status", async (req, res) => {
  if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });
  const { status } = req.body;
  if (!['active', 'disabled'].includes(status)) return res.status(400).json({ error: "Invalid status" });
  const { error } = await supabaseAdmin.from('profiles').update({ status }).eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Delete user
router.delete("/users/:id", async (req, res) => {
  if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });
  const { error } = await supabaseAdmin.auth.admin.deleteUser(req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Settings (commission and integrations)
router.get("/settings", async (req, res) => {
  const config = getConfig();
  res.json(config);
});

router.put("/settings", async (req, res) => {
  const currentConfig = getConfig();
  const newConfig = { ...currentConfig, ...req.body };
  saveConfig(newConfig);
  res.json({ success: true, config: newConfig });
});

router.put("/integrations/:id", async (req, res) => {
  const currentConfig = getConfig();
  const integrationId = req.params.id;
  
  const integrations = currentConfig.integrations.map(int => {
    if (int.id === integrationId) {
      return { ...int, ...req.body };
    }
    return int;
  });
  
  // If it's a new integration that doesn't exist, we could add it, but for now we only support the built-in ones.
  const newConfig = { ...currentConfig, integrations };
  saveConfig(newConfig);
  res.json({ success: true, integration: integrations.find(i => i.id === integrationId) });
});

export default router;
