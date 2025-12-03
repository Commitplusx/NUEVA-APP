-- Enable pg_net extension to make HTTP requests
create extension if not exists pg_net;

-- Create the function that calls the Edge Function
create or replace function public.trigger_whatsapp_notification()
returns trigger as $$
declare
  request_body jsonb;
begin
  -- Only trigger if status changed
  if new.status is distinct from old.status then
    
    request_body := jsonb_build_object(
      'type', 'UPDATE',
      'table', 'orders',
      'schema', 'public',
      'record', row_to_json(new),
      'old_record', row_to_json(old)
    );

    -- Call the Edge Function
    -- Replace the URL with your actual project URL if different
    perform net.http_post(
      url := 'https://zqwiqhdvwkvoufkdjbhm.supabase.co/functions/v1/whatsapp-notifications',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxd2lxaGR2d2t2b3Vma2RqYmhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NTIyNzAsImV4cCI6MjA3NzQyODI3MH0.QchAQxm2TcpIu4MsrAdQhVtVLtkgPAptnUGmPeC0VBQ'
      ),
      body := request_body
    );
  end if;
  return new;
end;
$$ language plpgsql;

-- Create the trigger
drop trigger if exists on_order_status_change_whatsapp on public.orders;
create trigger on_order_status_change_whatsapp
after update on public.orders
for each row
execute function public.trigger_whatsapp_notification();
