-- ============================================================
-- Charan Organics LMS – Course Seed
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- It is safe to run multiple times (uses ON CONFLICT DO UPDATE).
-- ============================================================

-- 1. Insert the single course category
insert into public.lms_course_categories (id, name, slug, description)
values (
  '00000000-0000-0000-0000-000000000001',
  'Herbal Cosmetic Making',
  'herbal-cosmetic-making',
  'Practical video courses on making soaps, shampoos, skin care, body care, lip care and more using natural herbal ingredients.'
)
on conflict (slug) do update
  set name = excluded.name,
      description = excluded.description;

-- 2. Insert all 24 courses
-- Each course: published = true, featured = true for the first 6, price = 10000
insert into public.lms_courses (
  id, category_id, title, slug, description,
  youtube_url, price_inr, is_free, level,
  language, duration_minutes, published, featured
) values

-- 1
(
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Fragrance Soaps',
  'fragrance-soaps',
  'Learn how to make premium fragrance soaps using natural ingredients, essential oils and safe colourants. Covers melt & pour technique with 20+ soap variants including Rose, Lavender, Citrus and Sandal. Ideal for beginners wanting to start a soap-making business.',
  'https://youtu.be/rt4XHfB_eFg?si=h0i1I0AuMYcprm',
  10000, false, 'beginner', 'Telugu', 0, true, true
),

-- 2
(
  '10000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Coconut Milk Hair Conditioner',
  'coconut-milk-hair-conditioner',
  'Step-by-step formulation of a rich Coconut Milk Hair Conditioner. Understand the role of each ingredient — conditioning agents, emollients and preservatives — and learn to adjust the formula for dry, oily and damaged hair types.',
  'https://youtu.be/sFVut5PnuLU?si=VVnTlNtsulfoITjh',
  10000, false, 'beginner', 'Telugu', 0, true, true
),

-- 3
(
  '10000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'Peel Off Face Mask',
  'peel-off-face-mask',
  'Formulate a salon-quality Peel Off Face Mask at home. This lesson covers gelling agents, skin-safe pigments, active extracts and the right consistency for effective peel-off action. Suitable for all skin types.',
  'https://youtu.be/eTx6qi8MRrI?si=uCJRsXKCvPanWtZQ',
  10000, false, 'beginner', 'Telugu', 0, true, true
),

-- 4
(
  '10000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000001',
  'Hair Serum',
  'hair-serum',
  'Create lightweight, silicone-free Hair Serums for frizz control, shine and split-end repair. Learn seven professional serum formulas — Regrowth, Shiny, Dry Hair, Hair Repair, Hair Loss Control, Damaged Hair and Split Ends Serum.',
  'https://youtu.be/ulCpXwE-bzs?si=_9iu4Ya_DNQ9QRkI',
  10000, false, 'beginner', 'Telugu', 0, true, true
),

-- 5
(
  '10000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000001',
  'Clay Cleansers, Dry Foam Face Wash Powders & Peel Off Masks',
  'clay-cleansers-dry-foam-peel-off',
  'A comprehensive lesson covering three distinct product categories: kaolin & bentonite clay cleansers, water-activated dry foam face wash powders and flexible peel-off masks. Perfect for building a multi-product skincare range.',
  'https://youtu.be/rZoHUn-CNNM?si=gQMl0ldCciTlc7W',
  10000, false, 'intermediate', 'Telugu', 0, true, true
),

-- 6
(
  '10000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000001',
  'Body Butters',
  'body-butters',
  'Master the art of whipped and solid Body Butters using Shea, Mango, Cocoa and Kokum butters. Learn five variants: Apricot, Coconut Milk, Argan, Onion and more. Includes packaging and shelf-life tips.',
  'https://youtu.be/TUJp-tODu4w?si=2tgZvv06hkMjdBVH',
  10000, false, 'beginner', 'Telugu', 0, true, true
),

-- 7
(
  '10000000-0000-0000-0000-000000000007',
  '00000000-0000-0000-0000-000000000001',
  'Wax Powder (Herbal)',
  'wax-powder-herbal',
  'Learn to make Herbal Wax Powder for body hair removal — a natural, chemical-free alternative to strip wax. Covers ingredient ratios, temperature control and application technique for home and salon use.',
  'https://youtu.be/6EW2PjI1u40?si=5RKoshYe1TVXHwGh',
  10000, false, 'beginner', 'Telugu', 0, true, false
),

-- 8
(
  '10000000-0000-0000-0000-000000000008',
  '00000000-0000-0000-0000-000000000001',
  'Shampoo Making',
  'shampoo-making',
  'Formulate 20+ herbal shampoos from scratch — Neem, Aloe Vera, Onion, Bhringaraj, Hibiscus and more. Understand surfactants, conditioning agents, pH balancing and natural fragrance blending for scalp-safe shampoos.',
  'https://youtu.be/pPySrlyIcEs?si=uatqA1eodv5wkpBy',
  10000, false, 'beginner', 'Telugu', 0, true, false
),

-- 9
(
  '10000000-0000-0000-0000-000000000009',
  '00000000-0000-0000-0000-000000000001',
  'Herbal Toothpaste',
  'herbal-toothpaste',
  'Make your own fluoride-free Herbal Toothpaste using Neem, Clove, Charcoal and Miswak extracts. Covers binders, humectants, abrasives and flavouring for a natural oral care product.',
  'https://youtu.be/tXNtGb-f9Xs?si=InQTPRPFPBIwiiZA',
  10000, false, 'beginner', 'Telugu', 0, true, false
),

-- 10
(
  '10000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  'Foot Cream',
  'foot-cream',
  'Formulate a rich, healing Foot Cream for cracked heels and rough skin. Learn the role of urea, shea butter, peppermint and tea tree oil in a balanced emulsion and understand preservative selection for foot products.',
  'https://youtu.be/r1G6KbWpcpI?si=t2CeVCsyO_PG7qJ',
  10000, false, 'beginner', 'Telugu', 0, true, false
),

-- 11
(
  '10000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000001',
  'Glossy Lipstick',
  'glossy-lipstick',
  'Create luxurious Glossy Lipsticks using waxes, oils and skin-safe cosmetic pigments. This lesson covers pour temperatures, mould techniques, shade customisation and packaging for market-ready lip colour products.',
  'https://youtu.be/pnd7gTvIiRE?si=ylyaDmKl6dF3U-B3',
  10000, false, 'intermediate', 'Telugu', 0, true, false
),

-- 12
(
  '10000000-0000-0000-0000-000000000012',
  '00000000-0000-0000-0000-000000000001',
  'Saffron Face Wash',
  'saffron-face-wash',
  'Formulate a brightening Saffron Face Wash with gentle surfactants, saffron extract, vitamin C and kojic acid. Learn pH testing, foam building and preservative pairing for a shelf-stable glow-boosting cleanser.',
  'https://youtu.be/K8Qg9JpDLFY?si=kP_y4jLX-KY1fU3M',
  10000, false, 'beginner', 'Telugu', 0, true, false
),

-- 13
(
  '10000000-0000-0000-0000-000000000013',
  '00000000-0000-0000-0000-000000000001',
  'Dark Neck Blackness Removal Cream',
  'dark-neck-removal-cream',
  'Develop an effective Dark Neck & Skin Blackness Removal Cream using licorice extract, kojic acid, niacinamide and natural butters. Understand skin-lightening actives, emulsion stability and safe usage guidelines.',
  'https://youtu.be/p530DLHDq-4?si=vtz11H2pHmYPTXud',
  10000, false, 'intermediate', 'Telugu', 0, true, false
),

-- 14
(
  '10000000-0000-0000-0000-000000000014',
  '00000000-0000-0000-0000-000000000001',
  'Body Lotion',
  'body-lotion',
  'Create smooth, fast-absorbing Body Lotions — Face & Body, Whitening and Moisturising variants. Learn emulsification ratios, humectant selection and fragrance blending for a professional, market-ready lotion.',
  'https://youtu.be/xl4Et1w7qv4?si=ONpJNsbZfoUK6Qqo',
  10000, false, 'beginner', 'Telugu', 0, true, false
),

-- 15
(
  '10000000-0000-0000-0000-000000000015',
  '00000000-0000-0000-0000-000000000001',
  'Cold Process Soaps',
  'cold-process-soaps',
  'Master professional Cold Process Soap making — the traditional saponification method. Covers lye safety, oil superfat calculations, trace stages, moulding, curing and natural colourant use for long-lasting artisan bars.',
  'https://youtu.be/ThOaESAoglQ?si=zHEkU6PGKEkbaI39',
  10000, false, 'intermediate', 'Telugu', 0, true, false
),

-- 16
(
  '10000000-0000-0000-0000-000000000016',
  '00000000-0000-0000-0000-000000000001',
  'Hand Wash',
  'hand-wash',
  'Formulate gentle, effective liquid Hand Washes using plant-derived surfactants, moisturising agents and natural fragrances. Learn viscosity adjustment, preservative systems and filling techniques for home and commercial production.',
  'https://youtu.be/JMc0FCOCLIQ?si=Siv4EtdW2tgpjcHK',
  10000, false, 'beginner', 'Telugu', 0, true, false
),

-- 17
(
  '10000000-0000-0000-0000-000000000017',
  '00000000-0000-0000-0000-000000000001',
  'Shampoo Bar',
  'shampoo-bar',
  'Make solid Shampoo Bars — a zero-waste alternative to liquid shampoo. Covers syndet bar formulation using SLSA, conditioning actives and botanical extracts. Includes bar shaping, drying time and packaging guidance.',
  'https://youtu.be/shWZIP_rVRk?si=QFVX3FVHfKjPjk6J',
  10000, false, 'intermediate', 'Telugu', 0, true, false
),

-- 18
(
  '10000000-0000-0000-0000-000000000018',
  '00000000-0000-0000-0000-000000000001',
  'Whipping Cream (Body)',
  'whipping-cream-body',
  'Learn to whip a luxurious Body Whipping Cream with a light, airy texture. Covers whipping techniques, oil-to-butter ratios, stiffening agents and fragrance blending for a premium body care product.',
  'https://youtu.be/B8lbEo67XhM?si=ZIBBwkX8py5Pkdr7',
  10000, false, 'beginner', 'Telugu', 0, true, false
),

-- 19
(
  '10000000-0000-0000-0000-000000000019',
  '00000000-0000-0000-0000-000000000001',
  'Body Wash',
  'body-wash',
  'Formulate refreshing Body Washes in Aloe Vera, Green Tea, Rose Water, Goat Milk and Herbal variants. Understand surfactant blending, pH optimisation, pearlising agents and natural fragrance layering.',
  'https://youtu.be/ehZuZlp9gzg?si=jLue8ZZ1f4RNjReW',
  10000, false, 'beginner', 'Telugu', 0, true, false
),

-- 20
(
  '10000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000001',
  'Sleeping Mask',
  'sleeping-mask',
  'Create an overnight Sleeping Mask that repairs and nourishes skin while you sleep. Learn gel-cream formulation, skin-barrier actives like ceramides and hyaluronic acid, and texture balancing for a non-sticky finish.',
  'https://youtu.be/yYM9j0k-yk8?si=TNoD30XxDkDKbeIE',
  10000, false, 'intermediate', 'Telugu', 0, true, false
),

-- 21
(
  '10000000-0000-0000-0000-000000000021',
  '00000000-0000-0000-0000-000000000001',
  'Face Gels',
  'face-gels',
  'Formulate cooling, hydrating Face Gels using Aloe Vera, Cucumber and Green Tea bases. Covers gelling agents (carbomer, xanthan), active ingredient incorporation and transparent gel clarity techniques.',
  'https://youtu.be/s35BCRZPXoI?si=hctxxV7Aw_RppfaJ',
  10000, false, 'beginner', 'Telugu', 0, true, false
),

-- 22
(
  '10000000-0000-0000-0000-000000000022',
  '00000000-0000-0000-0000-000000000001',
  'Homemade Organic Kajal',
  'homemade-organic-kajal',
  'Make traditional Organic Kajal (Kohl) at home using pure castor oil, ghee and lamp black. Learn the ancient preparation method, hygiene practices and safe application. A chemical-free alternative to commercial eyeliner.',
  'https://youtu.be/n11oYuwDJC8?si=MCv0qIuKMDGS7Z2w',
  10000, false, 'beginner', 'Telugu', 0, true, false
),

-- 23
(
  '10000000-0000-0000-0000-000000000023',
  '00000000-0000-0000-0000-000000000001',
  'Organic Lipstick',
  'organic-lipstick',
  'Formulate rich, pigmented Organic Lipsticks using natural waxes (candelilla, carnauba), plant oils and cosmetic-grade micas. Covers shade development, lip-safe preservatives and mould pouring for a professional finish.',
  'https://youtu.be/IRddxGdoffw?si=liSwIpY4YhrF29Ye',
  10000, false, 'intermediate', 'Telugu', 0, true, false
),

-- 24
(
  '10000000-0000-0000-0000-000000000024',
  '00000000-0000-0000-0000-000000000001',
  'Herbal Bath & Body Essentials',
  'herbal-bath-body-essentials',
  'A complete walkthrough of herbal bath and body essentials — bath salts, foot soaks, body brightening oils and aromatic bath bombs. Learn ingredient sourcing, blending ratios and packaging for a full bath & body line.',
  'https://youtu.be/Z35UMuYZztw?si=xK25r_KclssbGW9M',
  10000, false, 'beginner', 'Telugu', 0, true, false
)

on conflict (slug) do update
  set
    title          = excluded.title,
    description    = excluded.description,
    youtube_url    = excluded.youtube_url,
    price_inr      = excluded.price_inr,
    level          = excluded.level,
    language       = excluded.language,
    published      = excluded.published,
    featured       = excluded.featured,
    updated_at     = now();

-- 3. For each course add one module and one lesson
-- (so the course detail page shows a lesson list)
-- Modules
insert into public.lms_modules (id, course_id, title, sort_order) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Main Lesson', 1),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Main Lesson', 1),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Main Lesson', 1),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'Main Lesson', 1),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'Main Lesson', 1),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', 'Main Lesson', 1),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000007', 'Main Lesson', 1),
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000008', 'Main Lesson', 1),
  ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000009', 'Main Lesson', 1),
  ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000010', 'Main Lesson', 1),
  ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000011', 'Main Lesson', 1),
  ('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000012', 'Main Lesson', 1),
  ('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000013', 'Main Lesson', 1),
  ('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000014', 'Main Lesson', 1),
  ('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000015', 'Main Lesson', 1),
  ('20000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000016', 'Main Lesson', 1),
  ('20000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000017', 'Main Lesson', 1),
  ('20000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000018', 'Main Lesson', 1),
  ('20000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000019', 'Main Lesson', 1),
  ('20000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000020', 'Main Lesson', 1),
  ('20000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000021', 'Main Lesson', 1),
  ('20000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000022', 'Main Lesson', 1),
  ('20000000-0000-0000-0000-000000000023', '10000000-0000-0000-0000-000000000023', 'Main Lesson', 1),
  ('20000000-0000-0000-0000-000000000024', '10000000-0000-0000-0000-000000000024', 'Main Lesson', 1)
on conflict do nothing;

-- Lessons
insert into public.lms_lessons (id, module_id, title, slug, sort_order, is_preview, published) values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Fragrance Soaps – Full Video', 'main-video', 1, false, true),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Coconut Milk Hair Conditioner – Full Video', 'main-video', 1, false, true),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'Peel Off Face Mask – Full Video', 'main-video', 1, false, true),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', 'Hair Serum – Full Video', 'main-video', 1, false, true),
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', 'Clay Cleansers & Peel Off – Full Video', 'main-video', 1, false, true),
  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000006', 'Body Butters – Full Video', 'main-video', 1, false, true),
  ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000007', 'Wax Powder – Full Video', 'main-video', 1, false, true),
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000008', 'Shampoo Making – Full Video', 'main-video', 1, false, true),
  ('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000009', 'Herbal Toothpaste – Full Video', 'main-video', 1, false, true),
  ('30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000010', 'Foot Cream – Full Video', 'main-video', 1, false, true),
  ('30000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000011', 'Glossy Lipstick – Full Video', 'main-video', 1, false, true),
  ('30000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000012', 'Saffron Face Wash – Full Video', 'main-video', 1, false, true),
  ('30000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000013', 'Dark Neck Removal Cream – Full Video', 'main-video', 1, false, true),
  ('30000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000014', 'Body Lotion – Full Video', 'main-video', 1, false, true),
  ('30000000-0000-0000-0000-000000000015', '20000000-0000-0000-0000-000000000015', 'Cold Process Soaps – Full Video', 'main-video', 1, false, true),
  ('30000000-0000-0000-0000-000000000016', '20000000-0000-0000-0000-000000000016', 'Hand Wash – Full Video', 'main-video', 1, false, true),
  ('30000000-0000-0000-0000-000000000017', '20000000-0000-0000-0000-000000000017', 'Shampoo Bar – Full Video', 'main-video', 1, false, true),
  ('30000000-0000-0000-0000-000000000018', '20000000-0000-0000-0000-000000000018', 'Whipping Cream – Full Video', 'main-video', 1, false, true),
  ('30000000-0000-0000-0000-000000000019', '20000000-0000-0000-0000-000000000019', 'Body Wash – Full Video', 'main-video', 1, false, true),
  ('30000000-0000-0000-0000-000000000020', '20000000-0000-0000-0000-000000000020', 'Sleeping Mask – Full Video', 'main-video', 1, false, true),
  ('30000000-0000-0000-0000-000000000021', '20000000-0000-0000-0000-000000000021', 'Face Gels – Full Video', 'main-video', 1, false, true),
  ('30000000-0000-0000-0000-000000000022', '20000000-0000-0000-0000-000000000022', 'Homemade Organic Kajal – Full Video', 'main-video', 1, false, true),
  ('30000000-0000-0000-0000-000000000023', '20000000-0000-0000-0000-000000000023', 'Organic Lipstick – Full Video', 'main-video', 1, false, true),
  ('30000000-0000-0000-0000-000000000024', '20000000-0000-0000-0000-000000000024', 'Herbal Bath & Body Essentials – Full Video', 'main-video', 1, false, true)
on conflict do nothing;

-- 4. Link each video's YouTube ID to its lesson
insert into public.lms_videos (id, lesson_id, youtube_video_id, is_preview) values
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'rt4XHfB_eFg', false),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'sFVut5PnuLU', false),
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', 'eTx6qi8MRrI', false),
  ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004', 'ulCpXwE-bzs', false),
  ('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000005', 'rZoHUn-CNNM', false),
  ('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000006', 'TUJp-tODu4w', false),
  ('40000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000007', '6EW2PjI1u40', false),
  ('40000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000008', 'pPySrlyIcEs', false),
  ('40000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000009', 'tXNtGb-f9Xs', false),
  ('40000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000010', 'r1G6KbWpcpI', false),
  ('40000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000011', 'pnd7gTvIiRE', false),
  ('40000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000012', 'K8Qg9JpDLFY', false),
  ('40000000-0000-0000-0000-000000000013', '30000000-0000-0000-0000-000000000013', 'p530DLHDq-4', false),
  ('40000000-0000-0000-0000-000000000014', '30000000-0000-0000-0000-000000000014', 'xl4Et1w7qv4', false),
  ('40000000-0000-0000-0000-000000000015', '30000000-0000-0000-0000-000000000015', 'ThOaESAoglQ', false),
  ('40000000-0000-0000-0000-000000000016', '30000000-0000-0000-0000-000000000016', 'JMc0FCOCLIQ', false),
  ('40000000-0000-0000-0000-000000000017', '30000000-0000-0000-0000-000000000017', 'shWZIP_rVRk', false),
  ('40000000-0000-0000-0000-000000000018', '30000000-0000-0000-0000-000000000018', 'B8lbEo67XhM', false),
  ('40000000-0000-0000-0000-000000000019', '30000000-0000-0000-0000-000000000019', 'ehZuZlp9gzg', false),
  ('40000000-0000-0000-0000-000000000020', '30000000-0000-0000-0000-000000000020', 'yYM9j0k-yk8', false),
  ('40000000-0000-0000-0000-000000000021', '30000000-0000-0000-0000-000000000021', 's35BCRZPXoI', false),
  ('40000000-0000-0000-0000-000000000022', '30000000-0000-0000-0000-000000000022', 'n11oYuwDJC8', false),
  ('40000000-0000-0000-0000-000000000023', '30000000-0000-0000-0000-000000000023', 'IRddxGdoffw', false),
  ('40000000-0000-0000-0000-000000000024', '30000000-0000-0000-0000-000000000024', 'Z35UMuYZztw', false)
on conflict do nothing;
