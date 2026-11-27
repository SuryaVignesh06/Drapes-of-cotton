-- ==============================================================================
-- DRAPES OF COTTON — Demonstration Catalog Seed Data
-- Run after applying 0001_initial_schema.sql and 0002_rls_and_functions.sql.
-- Note: Prices are stored as integer paise (e.g., 189900 = ₹1,899).
-- ==============================================================================

insert into public.store_settings (key, value)
values
  (
    'shipping_config',
    '{
      "currency": "INR",
      "methods": [
        {
          "id": "standard",
          "label": "Standard Insured Shipping",
          "description": "Configurable standard shipping rate across India",
          "ratePaise": 15000
        },
        {
          "id": "express",
          "label": "Express Priority Dispatch",
          "description": "Priority air dispatch where serviceable",
          "ratePaise": 30000
        }
      ],
      "coupons": {
        "WELCOME10": { "type": "percent", "value": 10, "minSubtotalPaise": 200000 }
      }
    }'::jsonb
  )
on conflict (key) do nothing;

insert into public.collections (id, name, slug, description, cover_image, is_featured, is_published, sort_order)
values
  ('11111111-1111-4111-8111-111111111101', 'Everyday Cotton', 'everyday-cotton', 'Breathable, softly draped cotton sarees suited to warm mornings and effortless daily wear.', '/images/collections/everyday-cotton.jpg', true, true, 1),
  ('11111111-1111-4111-8111-111111111102', 'Classic Cotton', 'classic-cotton', 'Timeless border compositions and balanced weaves rooted in understated Indian elegance.', '/images/collections/classic-cotton.jpg', true, true, 2),
  ('11111111-1111-4111-8111-111111111103', 'Handloom Collection', 'handloom-collection', 'Textured cotton weaves celebrating tactile slubs, crisp pleats, and natural grace.', '/images/collections/handloom-collection.svg', true, true, 3),
  ('11111111-1111-4111-8111-111111111104', 'Office Wear', 'office-wear', 'Poised, structured cotton silhouettes in calm neutrals and muted earthy tones.', '/images/collections/office-wear.svg', true, true, 4),
  ('11111111-1111-4111-8111-111111111105', 'Festive Edit', 'festive-edit', 'Luminous woven borders and rich natural tones crafted for intimate gatherings.', '/images/collections/festive-edit.svg', false, true, 5),
  ('11111111-1111-4111-8111-111111111106', 'Minimal Neutrals', 'minimal-neutrals', 'Ivory, sand, oat, and olive-toned cotton sarees with quiet tonal borders.', '/images/collections/minimal-neutrals.svg', false, true, 6)
on conflict (slug) do nothing;

insert into public.products (
  id, name, slug, sku, short_description, description,
  price, compare_at_price, fabric, weave, color, occasion,
  saree_length, blouse_piece_length, blouse_piece_included, care_instructions, origin,
  stock_quantity, is_featured, is_new, is_published, seo_title, seo_description
)
values
  (
    '22222222-2222-4222-8222-222222222201',
    'Kora Ivory Olive-Border Cotton Saree',
    'kora-ivory-olive-border-cotton-saree',
    'DOC-KIO-001',
    'Unbleached warm ivory cotton finished with a restrained muted-olive selvedge.',
    'Woven for calm everyday poise, the Kora Ivory Olive-Border Cotton Saree pairs a breathable matte cotton body with a crisp muted olive border and striped pallu. Softens gently with each wash while holding clean pleats.',
    245000, 285000, 'Cotton', 'Plain & Border Weave', 'Ivory', 'Everyday',
    '5.5 meters', '0.8 meters', true, 'Gentle cold hand wash separately with mild liquid detergent. Dry in shade.', 'India',
    14, true, true, true,
    'Kora Ivory Olive-Border Cotton Saree | Drapes of Cotton',
    'Warm ivory cotton saree with a muted olive border and matching blouse piece.'
  ),
  (
    '22222222-2222-4222-8222-222222222202',
    'Sage Meadow Fine Cotton Saree',
    'sage-meadow-fine-cotton-saree',
    'DOC-SMF-002',
    'Soft sage-olive cotton drape with delicate ivory temple accents along the border.',
    'An understated daytime saree in muted sage olive. Lightweight cotton yarns lend an airy fall that transitions smoothly from studio mornings to evening gatherings.',
    279000, null, 'Cotton', 'Fine Count Weave', 'Green', 'Office Wear',
    '5.5 meters', '0.8 meters', true, 'Cold hand wash separately. Steam iron on medium heat.', 'India',
    9, true, true, true,
    'Sage Meadow Fine Cotton Saree | Drapes of Cotton',
    'Sage olive fine cotton saree ideal for poised office and daytime wear.'
  ),
  (
    '22222222-2222-4222-8222-222222222203',
    'Oatmeal Linen-Weave Cotton Saree',
    'oatmeal-linen-weave-cotton-saree',
    'DOC-OLC-003',
    'Tactile sand-beige cotton blend featuring subtle slub texture and taupe stripes.',
    'Crafted with natural oatmeal tones and subtle cross-woven texture, this saree offers effortless structure and breathability throughout the day.',
    325000, 360000, 'Cotton Blend', 'Textured Slub Weave', 'Beige', 'Office Wear',
    '5.5 meters', '0.9 meters', true, 'Gentle cold wash or dry clean recommended for lasting crispness.', 'India',
    11, true, false, true,
    'Oatmeal Linen-Weave Cotton Saree | Drapes of Cotton',
    'Textured beige cotton blend saree with understated taupe border stripes.'
  ),
  (
    '22222222-2222-4222-8222-222222222204',
    'Indigo Dusk Classic Cotton Saree',
    'indigo-dusk-classic-cotton-saree',
    'DOC-IDC-004',
    'Deep dusty indigo cotton balanced with warm ivory woven pinstripes.',
    'A classic deep-blue cotton saree accented with fine ivory lines across the pallu. Designed for effortless draping and timeless wardrobe versatility.',
    295000, null, 'Cotton', 'Classic Border Weave', 'Blue', 'Everyday',
    '5.5 meters', '0.8 meters', true, 'Wash separately in cold water for the first two washes. Dry in shade.', 'India',
    7, true, true, true,
    'Indigo Dusk Classic Cotton Saree | Drapes of Cotton',
    'Classic indigo cotton saree with crisp ivory pallu accents.'
  ),
  (
    '22222222-2222-4222-8222-222222222205',
    'Marigold Ochre Festive Cotton Saree',
    'marigold-ochre-festive-cotton-saree',
    'DOC-MOF-005',
    'Warm earthy ochre cotton enriched with woven geometric pallu motifs.',
    'Radiating quiet warmth, this ochre-yellow cotton saree balances festive vibrancy with natural matte texture and crisp woven detailing.',
    385000, 425000, 'Cotton', 'Buta Motif Weave', 'Yellow', 'Festive',
    '5.5 meters', '0.85 meters', true, 'Dry clean first time, then gentle cold hand wash in shade.', 'India',
    6, false, true, true,
    'Marigold Ochre Festive Cotton Saree | Drapes of Cotton',
    'Earthy ochre cotton saree with subtle woven festive motifs.'
  ),
  (
    '22222222-2222-4222-8222-222222222206',
    'Rosewood Clay Soft Cotton Saree',
    'rosewood-clay-soft-cotton-saree',
    'DOC-RCS-006',
    'Muted dusty blush-pink cotton with delicate ivory selvedge detailing.',
    'A soft clay-pink cotton drape that feels airy against the skin. Minimalist ivory borders keep the silhouette calm, modern, and refined.',
    219000, null, 'Cotton', 'Plain Soft Weave', 'Pink', 'Casual',
    '5.5 meters', '0.8 meters', true, 'Gentle cold hand wash with mild detergent.', 'India',
    16, false, false, true,
    'Rosewood Clay Soft Cotton Saree | Drapes of Cotton',
    'Dusty pink cotton saree crafted for breathable everyday comfort.'
  ),
  (
    '22222222-2222-4222-8222-222222222207',
    'Charcoal Slate Striped Cotton Saree',
    'charcoal-slate-striped-cotton-saree',
    'DOC-CSS-007',
    'Deep charcoal-black cotton accented with fine stone-beige woven checks.',
    'Architectural and timeless, this charcoal cotton saree pairs dark earth depth with delicate muted-sand check lines for formal and evening wear.',
    349000, null, 'Cotton', 'Fine Check Weave', 'Black', 'Special Occasion',
    '5.5 meters', '0.8 meters', true, 'Gentle cold hand wash separately. Iron inside out on low-medium.', 'India',
    5, false, true, true,
    'Charcoal Slate Striped Cotton Saree | Drapes of Cotton',
    'Charcoal black cotton saree with fine woven stone-beige checks.'
  ),
  (
    '22222222-2222-4222-8222-222222222208',
    'Alabaster Pure Mul Cotton Saree',
    'alabaster-pure-mul-cotton-saree',
    'DOC-APM-008',
    'Featherlight white mul cotton with subtle woven selvedge and airy fall.',
    'Our lightest everyday cotton drape in crisp alabaster white. Designed for humid afternoons with minimal tonal border detailing.',
    189000, null, 'Cotton', 'Lightweight Mul Weave', 'White', 'Everyday',
    '5.5 meters', '0.8 meters', true, 'Hand wash cold with mild soap. Dry flat or on padded hanger in shade.', 'India',
    18, false, false, true,
    'Alabaster Pure Mul Cotton Saree | Drapes of Cotton',
    'Lightweight white mul cotton saree for breathable daily elegance.'
  )
on conflict (slug) do nothing;

insert into public.product_collections (product_id, collection_id)
values
  ('22222222-2222-4222-8222-222222222201', '11111111-1111-4111-8111-111111111101'),
  ('22222222-2222-4222-8222-222222222201', '11111111-1111-4111-8111-111111111106'),
  ('22222222-2222-4222-8222-222222222202', '11111111-1111-4111-8111-111111111104'),
  ('22222222-2222-4222-8222-222222222202', '11111111-1111-4111-8111-111111111106'),
  ('22222222-2222-4222-8222-222222222203', '11111111-1111-4111-8111-111111111103'),
  ('22222222-2222-4222-8222-222222222203', '11111111-1111-4111-8111-111111111104'),
  ('22222222-2222-4222-8222-222222222204', '11111111-1111-4111-8111-111111111102'),
  ('22222222-2222-4222-8222-222222222204', '11111111-1111-4111-8111-111111111101'),
  ('22222222-2222-4222-8222-222222222205', '11111111-1111-4111-8111-111111111105'),
  ('22222222-2222-4222-8222-222222222205', '11111111-1111-4111-8111-111111111103'),
  ('22222222-2222-4222-8222-222222222206', '11111111-1111-4111-8111-111111111101'),
  ('22222222-2222-4222-8222-222222222207', '11111111-1111-4111-8111-111111111102'),
  ('22222222-2222-4222-8222-222222222207', '11111111-1111-4111-8111-111111111105'),
  ('22222222-2222-4222-8222-222222222208', '11111111-1111-4111-8111-111111111101'),
  ('22222222-2222-4222-8222-222222222208', '11111111-1111-4111-8111-111111111106')
on conflict do nothing;

insert into public.product_images (product_id, image_url, alt_text, image_type, sort_order)
values
  ('22222222-2222-4222-8222-222222222201', '/images/products/kora-ivory-olive-main.jpg', 'Kora Ivory Olive-Border Cotton Saree front drape on ivory studio backdrop', 'main', 0),
  ('22222222-2222-4222-8222-222222222201', '/images/products/kora-ivory-olive-detail.svg', 'Close-up weave detail of Kora Ivory Olive-Border Cotton Saree', 'detail', 1),
  ('22222222-2222-4222-8222-222222222202', '/images/products/sage-meadow-main.svg', 'Sage Meadow Fine Cotton Saree full drape', 'main', 0),
  ('22222222-2222-4222-8222-222222222203', '/images/products/oatmeal-linen-main.svg', 'Oatmeal Linen-Weave Cotton Saree in natural beige', 'main', 0),
  ('22222222-2222-4222-8222-222222222204', '/images/products/indigo-dusk-main.svg', 'Indigo Dusk Classic Cotton Saree with ivory pinstripes', 'main', 0),
  ('22222222-2222-4222-8222-222222222205', '/images/products/marigold-ochre-main.svg', 'Marigold Ochre Festive Cotton Saree', 'main', 0),
  ('22222222-2222-4222-8222-222222222206', '/images/products/rosewood-clay-main.svg', 'Rosewood Clay Soft Cotton Saree', 'main', 0),
  ('22222222-2222-4222-8222-222222222207', '/images/products/charcoal-slate-main.svg', 'Charcoal Slate Striped Cotton Saree', 'main', 0),
  ('22222222-2222-4222-8222-222222222208', '/images/products/alabaster-mul-main.svg', 'Alabaster Pure Mul Cotton Saree', 'main', 0)
on conflict do nothing;
