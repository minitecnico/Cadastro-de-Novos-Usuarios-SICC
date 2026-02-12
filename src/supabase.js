// src/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qvghyfketlxnxnvwsake.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2Z2h5ZmtldGx4bnhudndzYWtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4Mzk3NTYsImV4cCI6MjA4NjQxNTc1Nn0.q00Ku-AXCvBKrV5sHxbJbiM3WWZRiQ46LiiUm2LeRJc";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
