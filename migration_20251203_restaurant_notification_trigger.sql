-- Update the function to handle INSERT events
create or replace function public.trigger_whatsapp_notification()
returns trigger as $$
declare
  request_body jsonb;
  record_data jsonb;
  old_record_data jsonb;
  operation_type text;
begin
  if TG_OP = 'INSERT' then
    operation_type := 'INSERT';
    record_data := row_to_json(new);
    old_record_data := null;
  elsif TG_OP = 'UPDATE' then
    operation_type := 'UPDATE';
    record_data := row_to_json(new);
    old_record_data := row_to_json(old);
    
    -- Only trigger if status changed for updates
    if new.status is not distinct from old.status then
      return new;
    end if;
  end if;

  request_body := jsonb_build_object(
    'type', operation_type,
    'table', 'orders',
    'schema', 'public',
    'record', record_data,
    'old_record', old_record_data
  );

  -- Call the Edge Function
  perform net.http_post(
    url := 'https://zqwiqhdvwkvoufkdjbhm.supabase.co/functions/v1/whatsapp-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxd2lxaGR2d2t2b3Vma2RqYmhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NTIyNzAsImV4cCI6MjA3NzQyODI3MH0.QchAQxm2TcpIu4MsrAdQhVtVLtkgPAptnUGmPeC0VBQ'
    ),
    body := request_body
  );

  return new;
end;
$$ language plpgsql;

-- Drop the old trigger that was only for UPDATE
drop trigger if exists on_order_status_change_whatsapp on public.orders;

-- Create a new trigger for both INSERT and UPDATE
create trigger on_order_change_whatsapp
after insert or update on public.orders
for each row
execute function public.trigger_whatsapp_notification();
