-- Add fcm_token column to profiles table
ALTER TABLE profiles ADD COLUMN fcm_token TEXT;

-- Add comment
COMMENT ON COLUMN profiles.fcm_token IS 'Firebase Cloud Messaging token for push notifications';
