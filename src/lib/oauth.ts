/* OAuth sign-in — two integration paths depending on provider:
   - google / apple / microsoft go through Lovable's managed auth bridge
     (src/integrations/lovable/index.ts), which hands a session to Supabase.
     Whether these actually work depends on those providers being enabled on
     the connected Lovable project — that's account-side config, not code.
   - github has no Lovable bridge, so it goes through Supabase's native OAuth
     directly. This REQUIRES a GitHub OAuth App (Client ID/Secret) registered
     in the Supabase dashboard under Authentication > Providers > GitHub —
     nothing here will work until that's done. */

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export type OAuthProvider = "google" | "github" | "apple" | "microsoft";

export async function signInWithProvider(provider: OAuthProvider, redirectPath = "/signin") {
  const redirectTo = `${window.location.origin}${redirectPath}`;

  if (provider === "github") {
    return supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo },
    });
  }

  return lovable.auth.signInWithOAuth(provider, { redirect_uri: redirectTo });
}
