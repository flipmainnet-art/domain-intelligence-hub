CREATE TABLE public.bot_accounts (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  state JSONB NOT NULL DEFAULT '{"running":false,"startedAt":null,"elapsedMs":0,"txns":[]}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.bot_accounts TO authenticated;
GRANT ALL ON public.bot_accounts TO service_role;
ALTER TABLE public.bot_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own bot account" ON public.bot_accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own bot account" ON public.bot_accounts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own bot account" ON public.bot_accounts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER bot_accounts_touch BEFORE UPDATE ON public.bot_accounts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();