CREATE TABLE enquiries (
 id TEXT PRIMARY KEY,
 request_id TEXT NOT NULL UNIQUE,
 payload_hash TEXT NOT NULL,
 client_hash TEXT NOT NULL,
 customer_name TEXT NOT NULL,
 email TEXT NOT NULL,
 whatsapp TEXT,
 contact_method TEXT NOT NULL CHECK(contact_method IN ('email','whatsapp')),
 occasion TEXT NOT NULL,
 event_date TEXT NOT NULL,
 publication_date TEXT NOT NULL,
 selected_template TEXT,
 package_preference TEXT,
 design_type TEXT NOT NULL,
 color_preferences TEXT,
 language_preferences TEXT NOT NULL,
 requested_features TEXT NOT NULL,
 hosting_type TEXT NOT NULL,
 hosting_days INTEGER NOT NULL CHECK(hosting_days BETWEEN 1 AND 3650),
 custom_domain TEXT,
 special_requests TEXT,
 requirements_json TEXT NOT NULL,
 privacy_consent INTEGER NOT NULL CHECK(privacy_consent = 1),
 consent_version TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'New' CHECK(status IN ('New','Reviewing','Quoted','Accepted','In Progress','Preview Sent','Completed','Cancelled')),
 notification_status TEXT NOT NULL DEFAULT 'not_configured' CHECK(notification_status IN ('not_configured','pending','sent','failed')),
 created_at INTEGER NOT NULL,
 updated_at INTEGER NOT NULL
);
CREATE INDEX enquiries_duplicate_lookup ON enquiries(client_hash,payload_hash,created_at);
CREATE INDEX enquiries_client_quota ON enquiries(client_hash,created_at);
CREATE INDEX enquiries_status_created ON enquiries(status,created_at);
CREATE TABLE enquiry_attempts (
 client_hash TEXT NOT NULL,
 window_start INTEGER NOT NULL,
 hits INTEGER NOT NULL DEFAULT 1,
 expires_at INTEGER NOT NULL,
 PRIMARY KEY(client_hash, window_start)
);
CREATE INDEX enquiry_attempts_expiry ON enquiry_attempts(expires_at);
