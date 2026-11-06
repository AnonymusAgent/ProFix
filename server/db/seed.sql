-- ============================================================
-- ProFix — seed data (generated from src/constants/mockData.ts
-- by server/src/db/generate-seed.ts — do not edit by hand)
-- Idempotent: safe to run repeatedly (upserts on unique keys).
-- ============================================================

-- ---------- services ----------
INSERT INTO services (slug, title, description, icon, category, features, image, price_label, price_cents, sort_order)
VALUES ('pipe-repair', 'Pipe Repair & Replacement', 'Expert repair and replacement of damaged, corroded, or burst pipes using advanced trenchless technology and long-lasting materials.', 'Wrench', 'plumbing', '["Burst pipe repair","Copper & PEX installation","Trenchless pipe lining","Pressure testing"]'::jsonb, 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&h=400&fit=crop', 'From $120', 12000, 0)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description,
  icon = EXCLUDED.icon, category = EXCLUDED.category, features = EXCLUDED.features,
  image = EXCLUDED.image, price_label = EXCLUDED.price_label, price_cents = EXCLUDED.price_cents,
  sort_order = EXCLUDED.sort_order, is_active = TRUE;

INSERT INTO services (slug, title, description, icon, category, features, image, price_label, price_cents, sort_order)
VALUES ('leak-detection', 'Leak Detection', 'State-of-the-art leak detection using thermal imaging and acoustic sensors to pinpoint hidden leaks without damaging your property.', 'Droplets', 'plumbing', '["Thermal imaging","Acoustic detection","Slab leak detection","Non-invasive methods"]'::jsonb, 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop', 'From $89', 8900, 1)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description,
  icon = EXCLUDED.icon, category = EXCLUDED.category, features = EXCLUDED.features,
  image = EXCLUDED.image, price_label = EXCLUDED.price_label, price_cents = EXCLUDED.price_cents,
  sort_order = EXCLUDED.sort_order, is_active = TRUE;

INSERT INTO services (slug, title, description, icon, category, features, image, price_label, price_cents, sort_order)
VALUES ('drain-cleaning', 'Drain Cleaning', 'Professional drain cleaning and unclogging services using hydro-jetting and camera inspection to restore full flow.', 'Waves', 'plumbing', '["Hydro-jetting","Camera inspection","Root removal","Preventive maintenance"]'::jsonb, 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&h=400&fit=crop', 'From $95', 9500, 2)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description,
  icon = EXCLUDED.icon, category = EXCLUDED.category, features = EXCLUDED.features,
  image = EXCLUDED.image, price_label = EXCLUDED.price_label, price_cents = EXCLUDED.price_cents,
  sort_order = EXCLUDED.sort_order, is_active = TRUE;

INSERT INTO services (slug, title, description, icon, category, features, image, price_label, price_cents, sort_order)
VALUES ('water-heater', 'Water Heater Installation', 'Installation, repair, and maintenance of tank and tankless water heaters from leading brands with full warranty coverage.', 'Flame', 'plumbing', '["Tankless systems","Tank replacement","Energy-efficient upgrades","Same-day service"]'::jsonb, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&h=400&fit=crop', 'From $250', 25000, 3)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description,
  icon = EXCLUDED.icon, category = EXCLUDED.category, features = EXCLUDED.features,
  image = EXCLUDED.image, price_label = EXCLUDED.price_label, price_cents = EXCLUDED.price_cents,
  sort_order = EXCLUDED.sort_order, is_active = TRUE;

INSERT INTO services (slug, title, description, icon, category, features, image, price_label, price_cents, sort_order)
VALUES ('bathroom-fitting', 'Bathroom & Kitchen Fitting', 'Complete bathroom and kitchen plumbing installations including fixtures, faucets, disposal units, and custom setups.', 'Bath', 'plumbing', '["Fixture installation","Faucet replacement","Garbage disposal","Custom solutions"]'::jsonb, 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop', 'From $175', 17500, 4)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description,
  icon = EXCLUDED.icon, category = EXCLUDED.category, features = EXCLUDED.features,
  image = EXCLUDED.image, price_label = EXCLUDED.price_label, price_cents = EXCLUDED.price_cents,
  sort_order = EXCLUDED.sort_order, is_active = TRUE;

INSERT INTO services (slug, title, description, icon, category, features, image, price_label, price_cents, sort_order)
VALUES ('emergency-plumbing', 'Emergency Plumbing', '24/7 emergency plumbing response for burst pipes, severe leaks, flooding, and sewer backups. Fast arrival guaranteed.', 'AlertTriangle', 'plumbing', '["24/7 availability","30-min response","Flood mitigation","Temporary repairs"]'::jsonb, 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=400&fit=crop', 'From $150', 15000, 5)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description,
  icon = EXCLUDED.icon, category = EXCLUDED.category, features = EXCLUDED.features,
  image = EXCLUDED.image, price_label = EXCLUDED.price_label, price_cents = EXCLUDED.price_cents,
  sort_order = EXCLUDED.sort_order, is_active = TRUE;

INSERT INTO services (slug, title, description, icon, category, features, image, price_label, price_cents, sort_order)
VALUES ('sewer-repair', 'Sewer Line Services', 'Comprehensive sewer line inspection, repair, and replacement using modern trenchless methods to minimize property disruption.', 'Construction', 'plumbing', '["Sewer camera inspection","Trenchless repair","Root intrusion removal","Line replacement"]'::jsonb, 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop', 'From $200', 20000, 6)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description,
  icon = EXCLUDED.icon, category = EXCLUDED.category, features = EXCLUDED.features,
  image = EXCLUDED.image, price_label = EXCLUDED.price_label, price_cents = EXCLUDED.price_cents,
  sort_order = EXCLUDED.sort_order, is_active = TRUE;

INSERT INTO services (slug, title, description, icon, category, features, image, price_label, price_cents, sort_order)
VALUES ('wiring-installation', 'Wiring & Rewiring', 'Complete electrical wiring installation and rewiring for new construction, renovations, and code compliance upgrades.', 'Cable', 'electrical', '["Full home rewiring","Code compliance","Structured cabling","Outlet installation"]'::jsonb, 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&h=400&fit=crop', 'From $200', 20000, 7)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description,
  icon = EXCLUDED.icon, category = EXCLUDED.category, features = EXCLUDED.features,
  image = EXCLUDED.image, price_label = EXCLUDED.price_label, price_cents = EXCLUDED.price_cents,
  sort_order = EXCLUDED.sort_order, is_active = TRUE;

INSERT INTO services (slug, title, description, icon, category, features, image, price_label, price_cents, sort_order)
VALUES ('circuit-repair', 'Circuit & Panel Repair', 'Expert electrical panel upgrades, circuit breaker replacement, and fault diagnosis to ensure safe and reliable power distribution.', 'CircuitBoard', 'electrical', '["Panel upgrades","Breaker replacement","Fault diagnosis","Load balancing"]'::jsonb, 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=400&fit=crop', 'From $175', 17500, 8)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description,
  icon = EXCLUDED.icon, category = EXCLUDED.category, features = EXCLUDED.features,
  image = EXCLUDED.image, price_label = EXCLUDED.price_label, price_cents = EXCLUDED.price_cents,
  sort_order = EXCLUDED.sort_order, is_active = TRUE;

INSERT INTO services (slug, title, description, icon, category, features, image, price_label, price_cents, sort_order)
VALUES ('lighting', 'Lighting Installation', 'Design and installation of interior and exterior lighting systems including LED upgrades, recessed lighting, and landscape lighting.', 'Lightbulb', 'electrical', '["LED conversion","Recessed lighting","Landscape lighting","Dimmer systems"]'::jsonb, 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600&h=400&fit=crop', 'From $110', 11000, 9)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description,
  icon = EXCLUDED.icon, category = EXCLUDED.category, features = EXCLUDED.features,
  image = EXCLUDED.image, price_label = EXCLUDED.price_label, price_cents = EXCLUDED.price_cents,
  sort_order = EXCLUDED.sort_order, is_active = TRUE;

INSERT INTO services (slug, title, description, icon, category, features, image, price_label, price_cents, sort_order)
VALUES ('ac-electrical', 'AC & HVAC Electrical', 'Electrical installation and maintenance for air conditioning and HVAC systems including dedicated circuits and thermostat wiring.', 'Wind', 'electrical', '["Dedicated circuits","Thermostat wiring","Compressor circuits","Maintenance plans"]'::jsonb, 'https://images.unsplash.com/photo-1631545806609-3cacb5b767d2?w=600&h=400&fit=crop', 'From $160', 16000, 10)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description,
  icon = EXCLUDED.icon, category = EXCLUDED.category, features = EXCLUDED.features,
  image = EXCLUDED.image, price_label = EXCLUDED.price_label, price_cents = EXCLUDED.price_cents,
  sort_order = EXCLUDED.sort_order, is_active = TRUE;

INSERT INTO services (slug, title, description, icon, category, features, image, price_label, price_cents, sort_order)
VALUES ('power-backup', 'Power Backup Systems', 'Installation of generators, UPS systems, and solar backup solutions to keep your home or business running during outages.', 'BatteryCharging', 'electrical', '["Generator installation","UPS systems","Solar integration","Transfer switches"]'::jsonb, 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=400&fit=crop', 'From $350', 35000, 11)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description,
  icon = EXCLUDED.icon, category = EXCLUDED.category, features = EXCLUDED.features,
  image = EXCLUDED.image, price_label = EXCLUDED.price_label, price_cents = EXCLUDED.price_cents,
  sort_order = EXCLUDED.sort_order, is_active = TRUE;

INSERT INTO services (slug, title, description, icon, category, features, image, price_label, price_cents, sort_order)
VALUES ('smart-home', 'Smart Home Setup', 'Transform your home with smart electrical systems including automated lighting, smart outlets, security cameras, and home automation hubs.', 'Smartphone', 'electrical', '["Smart switches","Automated lighting","Security cameras","Voice control"]'::jsonb, 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&h=400&fit=crop', 'From $275', 27500, 12)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description,
  icon = EXCLUDED.icon, category = EXCLUDED.category, features = EXCLUDED.features,
  image = EXCLUDED.image, price_label = EXCLUDED.price_label, price_cents = EXCLUDED.price_cents,
  sort_order = EXCLUDED.sort_order, is_active = TRUE;

INSERT INTO services (slug, title, description, icon, category, features, image, price_label, price_cents, sort_order)
VALUES ('emergency-electrical', 'Emergency Electrician', '24/7 emergency electrical services for power outages, exposed wiring, electrical fires, and other dangerous situations.', 'Zap', 'electrical', '["24/7 response","Electrical fire safety","Power restoration","Hazard mitigation"]'::jsonb, 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&h=400&fit=crop', 'From $150', 15000, 13)
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description,
  icon = EXCLUDED.icon, category = EXCLUDED.category, features = EXCLUDED.features,
  image = EXCLUDED.image, price_label = EXCLUDED.price_label, price_cents = EXCLUDED.price_cents,
  sort_order = EXCLUDED.sort_order, is_active = TRUE;

-- ---------- testimonials ----------
INSERT INTO testimonials (name, role, avatar, rating, text, service)
SELECT 'Sarah Mitchell', 'Homeowner', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face', 5, 'ProFix saved us during a Christmas Eve pipe burst. They arrived in 25 minutes and had everything fixed within two hours. Absolutely incredible service.', 'Emergency Plumbing'
WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE name = 'Sarah Mitchell' AND text = 'ProFix saved us during a Christmas Eve pipe burst. They arrived in 25 minutes and had everything fixed within two hours. Absolutely incredible service.');

INSERT INTO testimonials (name, role, avatar, rating, text, service)
SELECT 'James Rodriguez', 'Property Manager', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', 5, 'We manage 40+ rental properties and ProFix handles all our plumbing and electrical needs. Their response time and quality of work is unmatched in the industry.', 'Commercial Services'
WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE name = 'James Rodriguez' AND text = 'We manage 40+ rental properties and ProFix handles all our plumbing and electrical needs. Their response time and quality of work is unmatched in the industry.');

INSERT INTO testimonials (name, role, avatar, rating, text, service)
SELECT 'Emily Chen', 'Restaurant Owner', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', 5, 'They completely rewired our restaurant kitchen and installed new lighting. The work was flawless and they finished ahead of schedule. Highly recommend!', 'Commercial Electrical'
WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE name = 'Emily Chen' AND text = 'They completely rewired our restaurant kitchen and installed new lighting. The work was flawless and they finished ahead of schedule. Highly recommend!');

INSERT INTO testimonials (name, role, avatar, rating, text, service)
SELECT 'Michael Torres', 'Homeowner', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', 5, 'Had a complete bathroom renovation done by ProFix. From plumbing to electrical, everything was handled professionally. The attention to detail was exceptional.', 'Bathroom Renovation'
WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE name = 'Michael Torres' AND text = 'Had a complete bathroom renovation done by ProFix. From plumbing to electrical, everything was handled professionally. The attention to detail was exceptional.');

INSERT INTO testimonials (name, role, avatar, rating, text, service)
SELECT 'Lisa Park', 'Office Manager', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face', 5, 'ProFix installed a smart home system in our office. The automation they set up has cut our energy bills by 35%. Their team really knows their stuff.', 'Smart Home Setup'
WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE name = 'Lisa Park' AND text = 'ProFix installed a smart home system in our office. The automation they set up has cut our energy bills by 35%. Their team really knows their stuff.');

INSERT INTO testimonials (name, role, avatar, rating, text, service)
SELECT 'David Kim', 'General Contractor', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face', 5, 'As a contractor, I only work with the best subcontractors. ProFix is my go-to for all plumbing and electrical work. Reliable, skilled, and always on time.', 'New Construction'
WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE name = 'David Kim' AND text = 'As a contractor, I only work with the best subcontractors. ProFix is my go-to for all plumbing and electrical work. Reliable, skilled, and always on time.');

INSERT INTO testimonials (name, role, avatar, rating, text, service)
SELECT 'Amanda Foster', 'Homeowner', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face', 4, 'Had a tricky leak behind the wall that two other companies couldn''t find. ProFix used thermal imaging and found it within minutes. Problem solved in one visit.', 'Leak Detection'
WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE name = 'Amanda Foster' AND text = 'Had a tricky leak behind the wall that two other companies couldn''t find. ProFix used thermal imaging and found it within minutes. Problem solved in one visit.');

INSERT INTO testimonials (name, role, avatar, rating, text, service)
SELECT 'Robert Chang', 'Building Superintendent', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face', 5, 'Managing a 200-unit building requires dependable service partners. ProFix has been our exclusive plumbing and electrical provider for three years running.', 'Building Maintenance'
WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE name = 'Robert Chang' AND text = 'Managing a 200-unit building requires dependable service partners. ProFix has been our exclusive plumbing and electrical provider for three years running.');

-- ---------- faqs ----------
INSERT INTO faqs (question, answer, category, sort_order)
SELECT 'What areas do you serve?', 'We serve the entire Metro City metropolitan area including all surrounding suburbs within a 50-mile radius. For emergency services, we prioritize calls within 30 miles of our main office.', 'General', 0
WHERE NOT EXISTS (SELECT 1 FROM faqs WHERE question = 'What areas do you serve?');

INSERT INTO faqs (question, answer, category, sort_order)
SELECT 'Do you offer free estimates?', 'Yes! We provide free estimates for all standard plumbing and electrical work. Our technician will assess the job, explain the scope of work, and provide a transparent quote before any work begins.', 'General', 1
WHERE NOT EXISTS (SELECT 1 FROM faqs WHERE question = 'Do you offer free estimates?');

INSERT INTO faqs (question, answer, category, sort_order)
SELECT 'Are your technicians licensed and insured?', 'Absolutely. All our plumbers and electricians are fully licensed, bonded, and insured. We carry comprehensive liability insurance and workers compensation to protect both our team and your property.', 'General', 2
WHERE NOT EXISTS (SELECT 1 FROM faqs WHERE question = 'Are your technicians licensed and insured?');

INSERT INTO faqs (question, answer, category, sort_order)
SELECT 'What is your emergency response time?', 'Our average emergency response time is under 30 minutes within our primary service area. We maintain a dedicated emergency team available 24/7, 365 days a year, including holidays.', 'Emergency', 3
WHERE NOT EXISTS (SELECT 1 FROM faqs WHERE question = 'What is your emergency response time?');

INSERT INTO faqs (question, answer, category, sort_order)
SELECT 'How much does an emergency call-out cost?', 'Emergency call-out fees start at $150, which includes the first hour of labor. After-hours calls (10 PM - 6 AM) have a $50 surcharge. We always communicate costs upfront before beginning work.', 'Pricing', 4
WHERE NOT EXISTS (SELECT 1 FROM faqs WHERE question = 'How much does an emergency call-out cost?');

INSERT INTO faqs (question, answer, category, sort_order)
SELECT 'Do you offer maintenance plans?', 'Yes, we offer annual maintenance plans for both plumbing and electrical systems starting at $199/year. Plans include annual inspections, priority scheduling, and 15% off all repairs.', 'Pricing', 5
WHERE NOT EXISTS (SELECT 1 FROM faqs WHERE question = 'Do you offer maintenance plans?');

INSERT INTO faqs (question, answer, category, sort_order)
SELECT 'What payment methods do you accept?', 'We accept all major credit cards, debit cards, checks, bank transfers, and cash. For larger projects, we also offer flexible financing options with 0% APR for qualified customers.', 'Pricing', 6
WHERE NOT EXISTS (SELECT 1 FROM faqs WHERE question = 'What payment methods do you accept?');

INSERT INTO faqs (question, answer, category, sort_order)
SELECT 'Do you guarantee your work?', 'Yes! All our work comes with a minimum 1-year labor warranty. Parts warranties vary by manufacturer but typically range from 1-10 years. We stand behind every job we complete.', 'General', 7
WHERE NOT EXISTS (SELECT 1 FROM faqs WHERE question = 'Do you guarantee your work?');

INSERT INTO faqs (question, answer, category, sort_order)
SELECT 'Can you handle commercial projects?', 'Absolutely. We have a dedicated commercial team experienced in office buildings, restaurants, retail spaces, warehouses, and industrial facilities. We handle projects of all sizes.', 'General', 8
WHERE NOT EXISTS (SELECT 1 FROM faqs WHERE question = 'Can you handle commercial projects?');

INSERT INTO faqs (question, answer, category, sort_order)
SELECT 'How do I schedule an appointment?', 'You can schedule an appointment through our online booking form, by calling us at (555) 247-3690, or via WhatsApp. We typically offer same-day or next-day appointments for non-emergency work.', 'General', 9
WHERE NOT EXISTS (SELECT 1 FROM faqs WHERE question = 'How do I schedule an appointment?');

INSERT INTO faqs (question, answer, category, sort_order)
SELECT 'Do you offer smart home installation?', 'Yes! Our electrical team specializes in smart home installations including automated lighting, smart thermostats, security systems, voice control integration, and whole-home automation.', 'Electrical', 10
WHERE NOT EXISTS (SELECT 1 FROM faqs WHERE question = 'Do you offer smart home installation?');

INSERT INTO faqs (question, answer, category, sort_order)
SELECT 'How much does a plumber visit cost?', 'A diagnostic visit is $89 and is waived when you proceed with the repair. You always receive a written, itemised quote before any work begins — no hidden fees.', 'Plumbing', 11
WHERE NOT EXISTS (SELECT 1 FROM faqs WHERE question = 'How much does a plumber visit cost?');

INSERT INTO faqs (question, answer, category, sort_order)
SELECT 'Can you fix a burst pipe the same day?', 'Yes. Burst pipes are treated as emergencies: turn off your main water valve and call (555) 911-3690. Our average emergency arrival time is under 30 minutes in the Metro City area.', 'Plumbing', 12
WHERE NOT EXISTS (SELECT 1 FROM faqs WHERE question = 'Can you fix a burst pipe the same day?');

INSERT INTO faqs (question, answer, category, sort_order)
SELECT 'What should I do during a plumbing emergency?', 'First, locate and turn off your main water shut-off valve. If there''s flooding, turn off electricity to affected areas. Then call our emergency line at (555) 911-3690 immediately. Do not attempt DIY repairs on active leaks.', 'Emergency', 13
WHERE NOT EXISTS (SELECT 1 FROM faqs WHERE question = 'What should I do during a plumbing emergency?');

-- ---------- pricing plans ----------
INSERT INTO pricing_plans (slug, name, description, price_label, unit, features, is_highlighted, badge, sort_order)
VALUES ('diagnostic', 'Diagnostic Visit', 'Comprehensive inspection and assessment', '$89', 'per visit', '["Full system inspection","Problem diagnosis","Written assessment report","Repair cost estimate","Safety check included"]'::jsonb, FALSE, NULL, 0)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
  price_label = EXCLUDED.price_label, unit = EXCLUDED.unit, features = EXCLUDED.features,
  is_highlighted = EXCLUDED.is_highlighted, badge = EXCLUDED.badge, sort_order = EXCLUDED.sort_order;

INSERT INTO pricing_plans (slug, name, description, price_label, unit, features, is_highlighted, badge, sort_order)
VALUES ('standard', 'Standard Service', 'Most common repairs and installations', '$149', 'starting price', '["All diagnostic features","Standard repairs included","Quality parts & materials","1-year labor warranty","Clean-up after service","Follow-up support"]'::jsonb, TRUE, 'Most Popular', 1)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
  price_label = EXCLUDED.price_label, unit = EXCLUDED.unit, features = EXCLUDED.features,
  is_highlighted = EXCLUDED.is_highlighted, badge = EXCLUDED.badge, sort_order = EXCLUDED.sort_order;

INSERT INTO pricing_plans (slug, name, description, price_label, unit, features, is_highlighted, badge, sort_order)
VALUES ('maintenance', 'Annual Maintenance', 'Preventive care for your home systems', '$199', 'per year', '["Annual plumbing inspection","Annual electrical inspection","Priority scheduling","15% off all repairs","Emergency priority response","24/7 phone support","Seasonal maintenance tips"]'::jsonb, FALSE, NULL, 2)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
  price_label = EXCLUDED.price_label, unit = EXCLUDED.unit, features = EXCLUDED.features,
  is_highlighted = EXCLUDED.is_highlighted, badge = EXCLUDED.badge, sort_order = EXCLUDED.sort_order;

INSERT INTO pricing_plans (slug, name, description, price_label, unit, features, is_highlighted, badge, sort_order)
VALUES ('premium', 'Premium Project', 'Major installations and renovations', 'Custom', 'quote', '["Free detailed estimate","Project management","Premium materials","2-year labor warranty","Progress updates","Final walkthrough","Post-project support","Financing available"]'::jsonb, FALSE, NULL, 3)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
  price_label = EXCLUDED.price_label, unit = EXCLUDED.unit, features = EXCLUDED.features,
  is_highlighted = EXCLUDED.is_highlighted, badge = EXCLUDED.badge, sort_order = EXCLUDED.sort_order;
