/* WorthScope — Koko chat history persistence.
   Saves/loads Koko conversations so they survive refreshes and sign-outs.
   Context is 'dashboard' for the floating chat, or 'mission:<mission_id>' for a
   mission Q&A thread.

   NOTE: koko_chat_messages is created by the koko_quality_persistence migration.
   The generated Supabase types don't know it yet (Lovable regenerates them on
   migration), so these queries are intentionally untyped. */

import { supabase } from "@/integrations/supabase/client";

export type ChatRole = "user" | "koko";
export type ChatMessage = { role: ChatRole; content: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => supabase as any;

export async function loadChatHistory(context: string): Promise<ChatMessage[]> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return [];
  const { data } = await db()
    .from("koko_chat_messages")
    .select("role, content, created_at")
    .eq("user_id", u.user.id)
    .eq("context", context)
    .order("created_at", { ascending: true })
    .limit(50);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data as any[]) || []).map((r) => ({ role: r.role as ChatRole, content: r.content as string }));
}

export async function saveChatMessages(context: string, messages: ChatMessage[]): Promise<void> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user || messages.length === 0) return;
  const userId = u.user.id;
  await db()
    .from("koko_chat_messages")
    .insert(messages.map((m) => ({ user_id: userId, context, role: m.role, content: m.content })));
}

export async function clearChatHistory(context: string): Promise<void> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  await db().from("koko_chat_messages").delete().eq("user_id", u.user.id).eq("context", context);
}
