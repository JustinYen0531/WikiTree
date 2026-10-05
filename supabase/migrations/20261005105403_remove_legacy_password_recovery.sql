-- Remove the legacy recovery path that exposed hint questions and plaintext passwords.
-- Dropping user_security also deletes the stored hint answers and password copies.
drop function if exists public.verify_hint_and_get_password(text, text);
drop function if exists public.get_user_hint_question(text);
drop table if exists public.user_security;
