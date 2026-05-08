-- Emit a NOTIFY whenever a new Notification row is inserted.
-- The Node-side LISTEN client uses this to push events over SSE.
-- Payload is just the userId; the SSE client re-fetches via the API.

CREATE OR REPLACE FUNCTION notify_new_notification() RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('new_notification', NEW."userId");
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notification_inserted
AFTER INSERT ON "Notification"
FOR EACH ROW EXECUTE FUNCTION notify_new_notification();
