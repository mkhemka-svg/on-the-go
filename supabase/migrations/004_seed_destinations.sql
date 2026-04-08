-- ============================================================
-- On the GO! — Seed Trending Destinations
-- Run AFTER 003_rls_policies.sql
-- Images use Unsplash source URLs (free, no API key needed for seeding)
-- ============================================================

INSERT INTO destinations (name, country, image_url, is_trending) VALUES
  ('Paris',        'France',        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', TRUE),
  ('Tokyo',        'Japan',         'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', TRUE),
  ('New York',     'United States', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800', TRUE),
  ('Barcelona',    'Spain',         'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800', TRUE),
  ('Bali',         'Indonesia',     'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', TRUE),
  ('London',       'United Kingdom','https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800', TRUE),
  ('Cancún',       'Mexico',        'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800', TRUE),
  ('Rome',         'Italy',         'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800', TRUE),
  ('Miami',        'United States', 'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=800', TRUE),
  ('Amsterdam',    'Netherlands',   'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800', TRUE),
  ('Santorini',    'Greece',        'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800', TRUE),
  ('Maldives',     'Maldives',      'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800', TRUE);
