-- LEGACY / OPTIONAL: owner admin login no longer needs a seeded user.
-- The API accepts the owner email (ADMIN_EMAIL, default
-- alimukhtar@profix.com) with the password from the ADMIN_PASSWORD
-- environment variable (Vercel -> profix-backend) and creates the admin
-- row automatically on first login. Admin-role rows can NOT sign in with
-- a database password anymore, so this seed is only kept for reference
-- for older deployments; do not rely on its password.
INSERT INTO users (name, email, password_hash, role)
VALUES ('ProFix Admin', 'alimukhtar@profix.com', '$2a$12$QpUY8BevtoV.JlgDZyEWo.r4tPou4oF6eSDIRE/cf8fq0lDQJ4T3S', 'admin')
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name, role = 'admin', password_hash = EXCLUDED.password_hash;
