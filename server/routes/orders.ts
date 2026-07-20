import { Router } from "express";
import { supabaseAdmin } from "../supabase.js";
import { sendShippingUpdateEmail } from "../services/email.js";

const router = Router();

router.patch("/:id/status", async (req, res) => {
  if (!supabaseAdmin) return res.status(500).json({ error: "Supabase not configured" });
  
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: "Invalid token" });

  const orderId = req.params.id;
  const { status } = req.body; // 'processing', 'shipped', 'delivered', 'cancelled'
  
  // Verify order belongs to the seller (or is admin)
  const { data: order } = await supabaseAdmin.from('orders').select('*').eq('id', orderId).single();
  if (!order) return res.status(404).json({ error: "Order not found" });

  const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
  const isAdmin = profile?.role === 'admin';
  const isSeller = order.seller_id === user.id;

  if (!isAdmin && !isSeller) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { error } = await supabaseAdmin.from('orders').update({ status }).eq('id', orderId);
  if (error) return res.status(500).json({ error: error.message });

  // Try to send email
  try {
    const { data: buyer } = await supabaseAdmin.from('profiles').select('email, first_name').eq('id', order.buyer_id).single();
    if (buyer && buyer.email) {
      await sendShippingUpdateEmail(buyer.email, buyer.first_name, orderId, status);
    }
  } catch(err) {
    console.error("Failed to send shipping email:", err);
  }

  res.json({ success: true, status });
});

export default router;
