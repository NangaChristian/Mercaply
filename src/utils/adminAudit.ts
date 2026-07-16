import { supabase } from '../lib/supabase';

export async function logAdminAction(actionType: string, targetId: string, details?: string) {
  if (!supabase) return;
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    await supabase.from('admin_audit_logs').insert({
      admin_id: session.user.id,
      admin_email: session.user.email,
      action_type: actionType,
      target_id: targetId,
      details: details,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}
