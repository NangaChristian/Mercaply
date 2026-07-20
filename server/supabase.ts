import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

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

export const supabaseAdmin = (supabaseUrl && supabaseKey && isValidUrl(supabaseUrl))
  ? createClient(supabaseUrl, supabaseKey)
  : null;
