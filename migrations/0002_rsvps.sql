CREATE TABLE rsvps (
 id TEXT PRIMARY KEY,
 request_id TEXT NOT NULL UNIQUE,
 client_hash TEXT NOT NULL,
 payload_hash TEXT NOT NULL,
 template_id TEXT NOT NULL,
 event_date TEXT NOT NULL,
 full_name TEXT NOT NULL,
 email TEXT NOT NULL,
 attendance TEXT NOT NULL CHECK(attendance IN ('yes','no')),
 guests INTEGER NOT NULL CHECK((attendance = 'yes' AND guests BETWEEN 1 AND 10) OR (attendance = 'no' AND guests = 0)),
 message TEXT NOT NULL,
 privacy_consent INTEGER NOT NULL CHECK(privacy_consent = 1),
 consent_version TEXT NOT NULL,
 created_at INTEGER NOT NULL,
 UNIQUE(template_id,event_date,email)
);
CREATE INDEX rsvps_client_created ON rsvps(client_hash,created_at);
CREATE INDEX rsvps_duplicate ON rsvps(client_hash,payload_hash,created_at);
CREATE INDEX rsvps_event ON rsvps(template_id,event_date,created_at);
CREATE TABLE rsvp_attempts (
 client_hash TEXT NOT NULL,
 window_start INTEGER NOT NULL,
 hits INTEGER NOT NULL DEFAULT 1,
 expires_at INTEGER NOT NULL,
 PRIMARY KEY(client_hash,window_start)
);
CREATE INDEX rsvp_attempts_expiry ON rsvp_attempts(expires_at);
