-- ============================================================
-- SEED DATA — Development Only
-- ============================================================

-- Fixed test user UUID
-- In development, create this user via Supabase Auth first, then
-- the handle_new_user trigger will create the profile automatically.
-- The seed below manually inserts data assuming that user exists.

do $$
declare
  v_user_id uuid := '00000000-0000-0000-0000-000000000001';

  -- Company IDs
  v_co_acme     uuid := gen_random_uuid();
  v_co_globex   uuid := gen_random_uuid();
  v_co_initech  uuid := gen_random_uuid();
  v_co_umbrella uuid := gen_random_uuid();
  v_co_stark    uuid := gen_random_uuid();
  v_co_wayne    uuid := gen_random_uuid();
  v_co_hooli    uuid := gen_random_uuid();
  v_co_piedpiper uuid := gen_random_uuid();

  -- Deal stage IDs (matching the default pipeline)
  v_stage_lead        uuid;
  v_stage_qualified   uuid;
  v_stage_proposal    uuid;
  v_stage_negotiation uuid;
  v_stage_won         uuid;
  v_stage_lost        uuid;

  -- Contact IDs (declared for deal/activity/note linking)
  v_c01 uuid := gen_random_uuid();
  v_c02 uuid := gen_random_uuid();
  v_c03 uuid := gen_random_uuid();
  v_c04 uuid := gen_random_uuid();
  v_c05 uuid := gen_random_uuid();
  v_c06 uuid := gen_random_uuid();
  v_c07 uuid := gen_random_uuid();
  v_c08 uuid := gen_random_uuid();
  v_c09 uuid := gen_random_uuid();
  v_c10 uuid := gen_random_uuid();
  v_c11 uuid := gen_random_uuid();
  v_c12 uuid := gen_random_uuid();
  v_c13 uuid := gen_random_uuid();
  v_c14 uuid := gen_random_uuid();
  v_c15 uuid := gen_random_uuid();
  v_c16 uuid := gen_random_uuid();
  v_c17 uuid := gen_random_uuid();
  v_c18 uuid := gen_random_uuid();

  -- Deal IDs
  v_d01 uuid := gen_random_uuid();
  v_d02 uuid := gen_random_uuid();
  v_d03 uuid := gen_random_uuid();
  v_d04 uuid := gen_random_uuid();
  v_d05 uuid := gen_random_uuid();
  v_d06 uuid := gen_random_uuid();
  v_d07 uuid := gen_random_uuid();
  v_d08 uuid := gen_random_uuid();
  v_d09 uuid := gen_random_uuid();
  v_d10 uuid := gen_random_uuid();
  v_d11 uuid := gen_random_uuid();
  v_d12 uuid := gen_random_uuid();
  v_d13 uuid := gen_random_uuid();

  -- Tag IDs
  v_tag_hot     uuid := gen_random_uuid();
  v_tag_vip     uuid := gen_random_uuid();
  v_tag_partner uuid := gen_random_uuid();
  v_tag_ref     uuid := gen_random_uuid();
  v_tag_churned uuid := gen_random_uuid();
  v_tag_enterprise uuid := gen_random_uuid();

begin
  -- --------------------------------------------------------
  -- 1. Test profile (assumes auth.users row already exists)
  -- --------------------------------------------------------
  insert into public.profiles (id, full_name, avatar_url)
  values (v_user_id, 'Alex Johnson', null)
  on conflict (id) do nothing;

  -- --------------------------------------------------------
  -- 2. Look up the default deal stages (created by trigger)
  -- --------------------------------------------------------
  select id into v_stage_lead        from public.deal_stages where user_id = v_user_id and name = 'Lead';
  select id into v_stage_qualified   from public.deal_stages where user_id = v_user_id and name = 'Qualified';
  select id into v_stage_proposal    from public.deal_stages where user_id = v_user_id and name = 'Proposal';
  select id into v_stage_negotiation from public.deal_stages where user_id = v_user_id and name = 'Negotiation';
  select id into v_stage_won         from public.deal_stages where user_id = v_user_id and name = 'Closed Won';
  select id into v_stage_lost        from public.deal_stages where user_id = v_user_id and name = 'Closed Lost';

  -- --------------------------------------------------------
  -- 3. Companies (8)
  -- --------------------------------------------------------
  insert into public.companies (id, user_id, name, domain, industry, size, phone, website, address) values
    (v_co_acme,      v_user_id, 'Acme Corp',           'acme.com',        'Manufacturing',  '201-500', '(555) 100-0001', 'https://acme.com',        '{"street":"100 Industrial Pkwy","city":"Austin","state":"TX","zip":"73301","country":"US"}'::jsonb),
    (v_co_globex,    v_user_id, 'Globex Corporation',   'globex.com',      'Technology',     '51-200',  '(555) 100-0002', 'https://globex.com',      '{"street":"200 Innovation Dr","city":"San Jose","state":"CA","zip":"95110","country":"US"}'::jsonb),
    (v_co_initech,   v_user_id, 'Initech',              'initech.com',     'Software',       '51-200',  '(555) 100-0003', 'https://initech.com',     '{"street":"300 Tech Blvd","city":"Dallas","state":"TX","zip":"75201","country":"US"}'::jsonb),
    (v_co_umbrella,  v_user_id, 'Umbrella Industries',  'umbrella.io',     'Biotechnology',  '500+',    '(555) 100-0004', 'https://umbrella.io',     '{"street":"400 Research Way","city":"Raccoon City","state":"CO","zip":"80201","country":"US"}'::jsonb),
    (v_co_stark,     v_user_id, 'Stark Ventures',       'starkv.com',      'Venture Capital','11-50',   '(555) 100-0005', 'https://starkv.com',      '{"street":"500 Market St","city":"San Francisco","state":"CA","zip":"94105","country":"US"}'::jsonb),
    (v_co_wayne,     v_user_id, 'Wayne Enterprises',    'wayne-ent.com',   'Conglomerate',   '500+',    '(555) 100-0006', 'https://wayne-ent.com',   '{"street":"1 Wayne Tower","city":"Gotham","state":"NJ","zip":"07001","country":"US"}'::jsonb),
    (v_co_hooli,     v_user_id, 'Hooli',                'hooli.xyz',       'Technology',     '500+',    '(555) 100-0007', 'https://hooli.xyz',       '{"street":"700 Campus Dr","city":"Palo Alto","state":"CA","zip":"94304","country":"US"}'::jsonb),
    (v_co_piedpiper, v_user_id, 'Pied Piper',           'piedpiper.com',   'Technology',     '1-10',    '(555) 100-0008', 'https://piedpiper.com',   '{"street":"5230 Newell Rd","city":"Palo Alto","state":"CA","zip":"94303","country":"US"}'::jsonb);

  -- --------------------------------------------------------
  -- 4. Contacts (18)
  -- --------------------------------------------------------
  insert into public.contacts (id, user_id, first_name, last_name, email, phone, company_id, position, status, address, social_links, notes) values
    (v_c01, v_user_id, 'Sarah',    'Chen',       'sarah.chen@acme.com',          '(555) 200-0001', v_co_acme,      'VP of Engineering',       'active',   '{"city":"Austin","state":"TX","country":"US"}'::jsonb,                     '{"linkedin":"linkedin.com/in/sarachen"}'::jsonb,             'Key technical decision-maker.'),
    (v_c02, v_user_id, 'Marcus',   'Williams',   'marcus.w@globex.com',          '(555) 200-0002', v_co_globex,    'CTO',                     'active',   '{"city":"San Jose","state":"CA","country":"US"}'::jsonb,                   '{"linkedin":"linkedin.com/in/marcusw","twitter":"@marcusw"}'::jsonb, 'Met at SaaStr 2024.'),
    (v_c03, v_user_id, 'Emily',    'Rodriguez',  'emily.r@initech.com',          '(555) 200-0003', v_co_initech,   'Director of Operations',  'active',   '{"city":"Dallas","state":"TX","country":"US"}'::jsonb,                     null,                                                          null),
    (v_c04, v_user_id, 'James',    'O''Brien',   'james.ob@umbrella.io',         '(555) 200-0004', v_co_umbrella,  'Head of Procurement',     'active',   '{"city":"Denver","state":"CO","country":"US"}'::jsonb,                     '{"linkedin":"linkedin.com/in/jamesob"}'::jsonb,              'Budget cycle starts Q3.'),
    (v_c05, v_user_id, 'Aisha',    'Patel',      'aisha@starkv.com',             '(555) 200-0005', v_co_stark,     'Managing Partner',        'active',   '{"city":"San Francisco","state":"CA","country":"US"}'::jsonb,              '{"linkedin":"linkedin.com/in/aishapatel","twitter":"@aishap"}'::jsonb, 'Warm intro from David Kim.'),
    (v_c06, v_user_id, 'David',    'Kim',        'david.kim@wayne-ent.com',      '(555) 200-0006', v_co_wayne,     'CFO',                     'active',   '{"city":"New York","state":"NY","country":"US"}'::jsonb,                   '{"linkedin":"linkedin.com/in/davidkim"}'::jsonb,             null),
    (v_c07, v_user_id, 'Lisa',     'Thompson',   'lisa.t@hooli.xyz',             '(555) 200-0007', v_co_hooli,     'Product Manager',         'active',   '{"city":"Palo Alto","state":"CA","country":"US"}'::jsonb,                  null,                                                          'Interested in enterprise plan.'),
    (v_c08, v_user_id, 'Robert',   'Garcia',     'robert.g@piedpiper.com',       '(555) 200-0008', v_co_piedpiper, 'CEO',                     'active',   '{"city":"Palo Alto","state":"CA","country":"US"}'::jsonb,                  '{"linkedin":"linkedin.com/in/rgarcia"}'::jsonb,              'Early-stage startup. Price-sensitive.'),
    (v_c09, v_user_id, 'Priya',    'Sharma',     'priya.sharma@acme.com',        '(555) 200-0009', v_co_acme,      'Software Engineer',       'active',   '{"city":"Austin","state":"TX","country":"US"}'::jsonb,                     null,                                                          'Technical evaluator for Acme deal.'),
    (v_c10, v_user_id, 'Michael',  'Johnson',    'michael.j@globex.com',         '(555) 200-0010', v_co_globex,    'VP of Sales',             'active',   '{"city":"San Jose","state":"CA","country":"US"}'::jsonb,                   '{"linkedin":"linkedin.com/in/mjohnson"}'::jsonb,             'Champion for our product internally.'),
    (v_c11, v_user_id, 'Jennifer', 'Lee',        'jennifer.lee@email.com',       '(555) 200-0011', null,           'Freelance Consultant',    'active',   '{"city":"Seattle","state":"WA","country":"US"}'::jsonb,                    '{"linkedin":"linkedin.com/in/jenniferlee"}'::jsonb,          'Potential channel partner.'),
    (v_c12, v_user_id, 'Thomas',   'Anderson',   'thomas.a@email.com',           '(555) 200-0012', null,           null,                      'active',   '{"city":"Chicago","state":"IL","country":"US"}'::jsonb,                    null,                                                          'Inbound lead from website.'),
    (v_c13, v_user_id, 'Maria',    'Santos',     'maria.santos@umbrella.io',     '(555) 200-0013', v_co_umbrella,  'IT Director',             'active',   '{"city":"Denver","state":"CO","country":"US"}'::jsonb,                     null,                                                          null),
    (v_c14, v_user_id, 'Kevin',    'Brown',      'kevin.b@wayne-ent.com',        '(555) 200-0014', v_co_wayne,     'VP of Technology',        'inactive', '{"city":"New York","state":"NY","country":"US"}'::jsonb,                   null,                                                          'Left the company in Jan 2025.'),
    (v_c15, v_user_id, 'Amanda',   'Foster',     'amanda.f@email.com',           '(555) 200-0015', null,           'Independent Consultant',  'active',   '{"city":"Boston","state":"MA","country":"US"}'::jsonb,                     '{"linkedin":"linkedin.com/in/amandaf","twitter":"@amandaf"}'::jsonb, 'Referred by Lisa Thompson.'),
    (v_c16, v_user_id, 'Daniel',   'Wright',     'daniel.w@initech.com',         '(555) 200-0016', v_co_initech,   'CEO',                     'active',   '{"city":"Dallas","state":"TX","country":"US"}'::jsonb,                     '{"linkedin":"linkedin.com/in/danielw"}'::jsonb,              'Final decision-maker at Initech.'),
    (v_c17, v_user_id, 'Rachel',   'Green',      'rachel.g@hooli.xyz',           '(555) 200-0017', v_co_hooli,     'Engineering Manager',     'active',   '{"city":"Mountain View","state":"CA","country":"US"}'::jsonb,              null,                                                          null),
    (v_c18, v_user_id, 'Chris',    'Martinez',   'chris.m@starkv.com',           '(555) 200-0018', v_co_stark,     'Associate',               'archived', '{"city":"San Francisco","state":"CA","country":"US"}'::jsonb,              null,                                                          'No longer at Stark Ventures.');

  -- --------------------------------------------------------
  -- 5. Deals (13)
  -- --------------------------------------------------------
  insert into public.deals (id, user_id, title, value, stage_id, contact_id, company_id, probability, expected_close_date, closed_at, close_reason, description) values
    -- Lead stage
    (v_d01, v_user_id, 'Acme Corp — Platform License',        25000.00,  v_stage_lead,        v_c01, v_co_acme,      10, '2025-06-15', null, null, 'Initial interest in annual platform license.'),
    (v_d02, v_user_id, 'Pied Piper — Starter Plan',           5000.00,   v_stage_lead,        v_c08, v_co_piedpiper, 15, '2025-05-30', null, null, 'Small startup exploring our starter tier.'),

    -- Qualified stage
    (v_d03, v_user_id, 'Globex — Enterprise Suite',           75000.00,  v_stage_qualified,   v_c02, v_co_globex,    35, '2025-05-01', null, null, 'Qualified after demo. CTO is champion.'),
    (v_d04, v_user_id, 'Wayne Enterprises — Analytics Add-on', 30000.00, v_stage_qualified,   v_c06, v_co_wayne,     40, '2025-06-01', null, null, 'Upsell opportunity on existing account.'),

    -- Proposal stage
    (v_d05, v_user_id, 'Initech — Full Platform Migration',   120000.00, v_stage_proposal,    v_c16, v_co_initech,   55, '2025-04-15', null, null, 'Proposal sent 2025-02-20. Awaiting feedback.'),
    (v_d06, v_user_id, 'Umbrella — Research Division',        45000.00,  v_stage_proposal,    v_c04, v_co_umbrella,  50, '2025-05-15', null, null, 'Proposal for research division license.'),

    -- Negotiation stage
    (v_d07, v_user_id, 'Hooli — Department License',          60000.00,  v_stage_negotiation, v_c07, v_co_hooli,     70, '2025-04-01', null, null, 'Negotiating seat count and pricing.'),
    (v_d08, v_user_id, 'Acme Corp — Support Package',         15000.00,  v_stage_negotiation, v_c09, v_co_acme,      75, '2025-03-25', null, null, 'Premium support add-on. Almost closed.'),
    (v_d09, v_user_id, 'Stark Ventures — Portfolio Tools',    35000.00,  v_stage_negotiation, v_c05, v_co_stark,     65, '2025-04-10', null, null, 'Custom portfolio management integration.'),

    -- Closed Won
    (v_d10, v_user_id, 'Globex — Phase 1 Deployment',        50000.00,  v_stage_won,         v_c10, v_co_globex,    100, '2025-02-01', '2025-02-01 10:00:00+00', 'Signed after successful pilot.', 'Phase 1 of 3-phase rollout.'),
    (v_d11, v_user_id, 'Wayne — Core Platform',               90000.00,  v_stage_won,         v_c06, v_co_wayne,     100, '2025-01-15', '2025-01-12 14:30:00+00', 'Multi-year contract.', '3-year enterprise agreement.'),

    -- Closed Lost
    (v_d12, v_user_id, 'Umbrella — HQ License',              80000.00,  v_stage_lost,        v_c13, v_co_umbrella,  0,  '2025-01-31', '2025-01-28 09:00:00+00', 'Went with competitor (lower price).', 'Lost to competitor on price.'),
    (v_d13, v_user_id, 'Freelancer Network — Group Plan',    12000.00,  v_stage_lost,        v_c11, null,           0,  '2025-02-10', '2025-02-08 16:00:00+00', 'Budget not approved.',              'Independent consultants group plan.');

  -- --------------------------------------------------------
  -- 6. Activities (30)
  -- --------------------------------------------------------
  insert into public.activities (user_id, type, title, description, contact_id, company_id, deal_id, due_date, completed_at, is_completed) values
    -- Calls
    (v_user_id, 'call',    'Discovery call with Sarah Chen',          'Discussed platform requirements and timeline.',                v_c01, v_co_acme,      v_d01, '2025-02-10 10:00:00+00', '2025-02-10 10:45:00+00', true),
    (v_user_id, 'call',    'Follow-up call with Marcus Williams',     'Reviewed enterprise features and pricing.',                    v_c02, v_co_globex,    v_d03, '2025-02-12 14:00:00+00', '2025-02-12 14:30:00+00', true),
    (v_user_id, 'call',    'Pricing discussion with James O''Brien',  'Discussed volume discounts for research division.',            v_c04, v_co_umbrella,  v_d06, '2025-02-15 11:00:00+00', null,                     false),
    (v_user_id, 'call',    'Check-in with Lisa Thompson',             'Monthly check-in on department rollout progress.',             v_c07, v_co_hooli,     v_d07, '2025-02-18 15:00:00+00', null,                     false),
    (v_user_id, 'call',    'Intro call with Thomas Anderson',         'Inbound lead qualification.',                                 v_c12, null,           null,  '2025-02-20 09:00:00+00', null,                     false),

    -- Emails
    (v_user_id, 'email',   'Send proposal to Initech',                'Attach updated pricing and SOW.',                             v_c16, v_co_initech,   v_d05, '2025-02-08 09:00:00+00', '2025-02-08 09:30:00+00', true),
    (v_user_id, 'email',   'Send case study to Globex',               'Enterprise deployment case study requested by CTO.',           v_c02, v_co_globex,    v_d03, '2025-02-11 10:00:00+00', '2025-02-11 10:15:00+00', true),
    (v_user_id, 'email',   'Contract draft to Hooli',                 'Send initial contract with negotiated terms.',                 v_c07, v_co_hooli,     v_d07, '2025-02-13 08:00:00+00', '2025-02-13 08:45:00+00', true),
    (v_user_id, 'email',   'Follow-up with Robert Garcia',            'Check on budget approval for starter plan.',                   v_c08, v_co_piedpiper, v_d02, '2025-02-19 10:00:00+00', null,                     false),
    (v_user_id, 'email',   'Thank you note to David Kim',             'Thank for signing 3-year agreement.',                         v_c06, v_co_wayne,     v_d11, '2025-01-13 08:00:00+00', '2025-01-13 08:10:00+00', true),

    -- Meetings
    (v_user_id, 'meeting', 'Demo for Acme engineering team',          'Full platform demo for Sarah and her engineering leads.',      v_c01, v_co_acme,      v_d01, '2025-02-22 14:00:00+00', null,                     false),
    (v_user_id, 'meeting', 'Quarterly review with Globex',            'Review Phase 1 deployment metrics and plan Phase 2.',          v_c10, v_co_globex,    v_d10, '2025-03-01 10:00:00+00', null,                     false),
    (v_user_id, 'meeting', 'Negotiation meeting with Hooli',          'Final terms discussion with Lisa and legal team.',             v_c07, v_co_hooli,     v_d07, '2025-02-25 11:00:00+00', null,                     false),
    (v_user_id, 'meeting', 'Initech stakeholder presentation',        'Present platform to Initech C-suite.',                        v_c16, v_co_initech,   v_d05, '2025-02-28 15:00:00+00', null,                     false),
    (v_user_id, 'meeting', 'Stark Ventures integration planning',     'Technical deep-dive on portfolio tools integration.',          v_c05, v_co_stark,     v_d09, '2025-02-24 13:00:00+00', null,                     false),
    (v_user_id, 'meeting', 'Coffee with Jennifer Lee',                'Discuss channel partnership opportunities.',                   v_c11, null,           null,  '2025-02-26 09:30:00+00', null,                     false),

    -- Tasks
    (v_user_id, 'task',    'Prepare Initech proposal deck',           'Include ROI analysis and implementation timeline.',            null,  v_co_initech,   v_d05, '2025-02-07 17:00:00+00', '2025-02-07 16:30:00+00', true),
    (v_user_id, 'task',    'Update CRM with Hooli deal notes',        'Log latest negotiation terms and next steps.',                 null,  v_co_hooli,     v_d07, '2025-02-14 17:00:00+00', '2025-02-14 16:00:00+00', true),
    (v_user_id, 'task',    'Research Umbrella competitors',           'Analyze competitor offerings for next meeting.',                null,  v_co_umbrella,  v_d06, '2025-02-17 17:00:00+00', null,                     false),
    (v_user_id, 'task',    'Draft Stark integration spec',            'Technical spec for portfolio tools API integration.',           null,  v_co_stark,     v_d09, '2025-02-21 17:00:00+00', null,                     false),
    (v_user_id, 'task',    'Review Acme support package terms',       'Finalize SLA and support tiers for Acme add-on.',              null,  v_co_acme,      v_d08, '2025-02-16 17:00:00+00', null,                     false),
    (v_user_id, 'task',    'Send Wayne onboarding materials',         'Share implementation guide and training schedule.',             v_c06, v_co_wayne,     v_d11, '2025-01-20 17:00:00+00', '2025-01-20 15:00:00+00', true),
    (v_user_id, 'task',    'Qualify Thomas Anderson lead',            'Score lead and determine appropriate pipeline stage.',          v_c12, null,           null,  '2025-02-21 12:00:00+00', null,                     false),
    (v_user_id, 'task',    'Update forecast spreadsheet',             'Include latest pipeline changes in Q1 forecast.',              null,  null,           null,  '2025-02-23 17:00:00+00', null,                     false),

    -- Notes (activity type)
    (v_user_id, 'note',    'Acme budget cycle starts in April',       'Sarah mentioned they finalize next FY budget in April.',       v_c01, v_co_acme,      v_d01, null,                     null,                     false),
    (v_user_id, 'note',    'Globex evaluating 3 vendors',            'We are one of 3 vendors in final evaluation.',                 v_c02, v_co_globex,    v_d03, null,                     null,                     false),
    (v_user_id, 'note',    'Umbrella HQ loss post-mortem',           'Key takeaway: need more competitive pricing for 500+ orgs.',   v_c13, v_co_umbrella,  v_d12, null,                     null,                     false),
    (v_user_id, 'note',    'Hooli legal review in progress',         'Their legal team is reviewing contract. ETA 1 week.',          v_c07, v_co_hooli,     v_d07, null,                     null,                     false),
    (v_user_id, 'note',    'Jennifer interested in referral program', 'Wants to refer clients in exchange for commission.',           v_c11, null,           null,  null,                     null,                     false),
    (v_user_id, 'note',    'Pied Piper may raise Series A',         'If funded, could upgrade to professional plan.',               v_c08, v_co_piedpiper, v_d02, null,                     null,                     false);

  -- --------------------------------------------------------
  -- 7. Notes (standalone)
  -- --------------------------------------------------------
  insert into public.notes (user_id, content, contact_id, company_id, deal_id) values
    (v_user_id, 'Sarah is the primary technical decision-maker at Acme. Always loop her in on technical discussions.',                          v_c01, v_co_acme,      null),
    (v_user_id, 'Globex Phase 1 completed successfully. Plan Phase 2 kickoff for Q2.',                                                          v_c10, v_co_globex,    v_d10),
    (v_user_id, 'Initech migration is complex — they have 15 years of legacy data. Budget for extra implementation support.',                    null,  v_co_initech,   v_d05),
    (v_user_id, 'Wayne Enterprises signed a 3-year deal. Biggest contract to date. Key reference account.',                                      v_c06, v_co_wayne,     v_d11),
    (v_user_id, 'Umbrella loss: competitor offered 30% lower price. Need to revisit enterprise pricing strategy.',                               null,  v_co_umbrella,  v_d12),
    (v_user_id, 'Hooli department license could expand to company-wide if pilot succeeds.',                                                      v_c07, v_co_hooli,     v_d07),
    (v_user_id, 'Amanda Foster was referred by Lisa Thompson at Hooli. Specializes in CRM consulting — potential partner.',                      v_c15, null,           null),
    (v_user_id, 'Q1 pipeline looking strong. Total weighted value: ~$285K. Need to close Hooli and Acme Support by end of March.',               null,  null,           null);

  -- --------------------------------------------------------
  -- 8. Tags
  -- --------------------------------------------------------
  insert into public.tags (id, user_id, name, color) values
    (v_tag_hot,        v_user_id, 'Hot Lead',    '#EF4444'),
    (v_tag_vip,        v_user_id, 'VIP',         '#F59E0B'),
    (v_tag_partner,    v_user_id, 'Partner',     '#8B5CF6'),
    (v_tag_ref,        v_user_id, 'Referral',    '#3B82F6'),
    (v_tag_churned,    v_user_id, 'Churned',     '#6B7280'),
    (v_tag_enterprise, v_user_id, 'Enterprise',  '#10B981');

  -- --------------------------------------------------------
  -- 9. Contact tags
  -- --------------------------------------------------------
  insert into public.contact_tags (contact_id, tag_id) values
    (v_c01, v_tag_hot),         -- Sarah Chen: Hot Lead
    (v_c02, v_tag_enterprise),  -- Marcus Williams: Enterprise
    (v_c05, v_tag_vip),         -- Aisha Patel: VIP
    (v_c06, v_tag_vip),         -- David Kim: VIP
    (v_c06, v_tag_enterprise),  -- David Kim: Enterprise
    (v_c07, v_tag_hot),         -- Lisa Thompson: Hot Lead
    (v_c08, v_tag_ref),         -- Robert Garcia: Referral
    (v_c10, v_tag_enterprise),  -- Michael Johnson: Enterprise
    (v_c11, v_tag_partner),     -- Jennifer Lee: Partner
    (v_c12, v_tag_hot),         -- Thomas Anderson: Hot Lead
    (v_c14, v_tag_churned),     -- Kevin Brown: Churned
    (v_c15, v_tag_ref),         -- Amanda Foster: Referral
    (v_c15, v_tag_partner),     -- Amanda Foster: Partner
    (v_c16, v_tag_enterprise),  -- Daniel Wright: Enterprise
    (v_c18, v_tag_churned);     -- Chris Martinez: Churned

  -- --------------------------------------------------------
  -- 10. Deal tags
  -- --------------------------------------------------------
  insert into public.deal_tags (deal_id, tag_id) values
    (v_d03, v_tag_enterprise),  -- Globex Enterprise Suite
    (v_d05, v_tag_enterprise),  -- Initech Full Platform
    (v_d07, v_tag_hot),         -- Hooli Department License
    (v_d08, v_tag_hot),         -- Acme Support Package
    (v_d09, v_tag_vip),         -- Stark Portfolio Tools
    (v_d10, v_tag_enterprise),  -- Globex Phase 1
    (v_d11, v_tag_vip),         -- Wayne Core Platform
    (v_d11, v_tag_enterprise);  -- Wayne Core Platform

end $$;
