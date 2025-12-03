-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create function to call the Edge Function
CREATE OR REPLACE FUNCTION public.handle_push_notifications()
RETURNS TRIGGER AS $$
DECLARE
  project_url TEXT := 'https://zqwiqhdvwkvoufkdjbhm.supabase.co/functions/v1/push-notifications';
  anon_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxd2lxaGR2d2t2b3Vma2RqYmhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NTIyNzAsImV4cCI6MjA3NzQyODI3MH0.QchAQxm2TcpIu4MsrAdQhVtVLtkgPAptnUGmPeC0VBQ';
BEGIN
  -- Call the Edge Function via HTTP POST
  PERFORM net.http_post(
    url := project_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || anon_key
    ),
    body := jsonb_build_object(
      'type', TG_OP,
      'record', row_to_json(NEW),
      'old_record', CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE row_to_json(OLD) END, -- Handle OLD record safely
      'schema', TG_TABLE_SCHEMA,
      'table', TG_TABLE_NAME
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on orders table
DROP TRIGGER IF EXISTS on_order_change_notification ON public.orders;

CREATE TRIGGER on_order_change_notification
AFTER INSERT OR UPDATE ON public.orders
FOR EACH ROW
EXECUTE PROCEDURE public.handle_push_notifications();
