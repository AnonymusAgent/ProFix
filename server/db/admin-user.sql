-- ProFix admin user (password: Admin@12345 — change it after first login)
INSERT INTO users (name, email, password_hash, role)
VALUES ('ProFix Admin', 'admin@profixservices.com', '$2a$12$QpUY8BevtoV.JlgDZyEWo.r4tPou4oF6eSDIRE/cf8fq0lDQJ4T3S', 'admin')
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name, role = 'admin', password_hash = EXCLUDED.password_hash;
