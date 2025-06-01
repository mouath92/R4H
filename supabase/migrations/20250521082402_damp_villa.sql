/*
  # Insert Demo Spaces

  1. Changes
    - Create demo host user
    - Insert 4 demo spaces in Colombia
    - All spaces linked to demo host
    - Each space has unique details and amenities
    
  2. Security
    - Uses proper variable declaration and handling
    - Ensures no duplicate entries
*/

DO $$ 
DECLARE
  demo_host_id uuid;
BEGIN
  -- Insert or update demo host and get the ID
  INSERT INTO users (id, name, email, role, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'Moathal Aldeheish',
    'mouathaldeheish@gmail.com',
    'host',
    now(),
    now()
  )
  ON CONFLICT (email) DO UPDATE
  SET role = 'host'
  RETURNING id INTO demo_host_id;

  -- Insert demo spaces
  INSERT INTO spaces (
    title,
    description,
    address,
    price_per_hour,
    size_m2,
    image_urls,
    amenities,
    host_id,
    status
  )
  SELECT
    'Modern Studio in Chapinero',
    'Beautiful modern studio perfect for photoshoots and small events. Located in the heart of Chapinero, this bright and airy space features floor-to-ceiling windows with stunning city views.',
    'Calle 63 #4-21, Chapinero, Bogotá, Colombia',
    45.00,
    75,
    ARRAY[
      'https://images.pexels.com/photos/1743227/pexels-photo-1743227.jpeg',
      'https://images.pexels.com/photos/275484/pexels-photo-275484.jpeg'
    ],
    ARRAY['WiFi', 'Air Conditioning', 'Natural Light', 'Sound System', 'Restrooms', 'Kitchen'],
    demo_host_id,
    'active'
  WHERE NOT EXISTS (
    SELECT 1 FROM spaces WHERE address = 'Calle 63 #4-21, Chapinero, Bogotá, Colombia'
  );

  INSERT INTO spaces (
    title,
    description,
    address,
    price_per_hour,
    size_m2,
    image_urls,
    amenities,
    host_id,
    status
  )
  SELECT
    'Historic Villa in Cartagena',
    'Stunning colonial villa in the historic center of Cartagena. Perfect for events, weddings, and photo sessions. Features traditional architecture with modern amenities.',
    'Calle del Cuartel #36-118, Centro Histórico, Cartagena, Colombia',
    120.00,
    200,
    ARRAY[
      'https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg',
      'https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg'
    ],
    ARRAY['WiFi', 'Air Conditioning', 'Garden', 'Kitchen', 'Parking', 'Sound System', 'Security'],
    demo_host_id,
    'active'
  WHERE NOT EXISTS (
    SELECT 1 FROM spaces WHERE address = 'Calle del Cuartel #36-118, Centro Histórico, Cartagena, Colombia'
  );

  INSERT INTO spaces (
    title,
    description,
    address,
    price_per_hour,
    size_m2,
    image_urls,
    amenities,
    host_id,
    status
  )
  SELECT
    'Creative Loft in Poblado',
    'Industrial-style loft in Medellín''s trendiest neighborhood. High ceilings, exposed brick, and plenty of natural light make this space perfect for creative projects and meetings.',
    'Carrera 37 #10-15, El Poblado, Medellín, Colombia',
    65.00,
    120,
    ARRAY[
      'https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg',
      'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'
    ],
    ARRAY['WiFi', 'Standing Desks', 'Projector', 'Coffee Machine', 'Meeting Room', 'Whiteboard'],
    demo_host_id,
    'active'
  WHERE NOT EXISTS (
    SELECT 1 FROM spaces WHERE address = 'Carrera 37 #10-15, El Poblado, Medellín, Colombia'
  );

  INSERT INTO spaces (
    title,
    description,
    address,
    price_per_hour,
    size_m2,
    image_urls,
    amenities,
    host_id,
    status
  )
  SELECT
    'Rooftop Event Space Bogotá',
    'Spectacular rooftop venue with panoramic views of the city and mountains. Perfect for corporate events, launches, and social gatherings.',
    'Carrera 7 #71-21, Zona G, Bogotá, Colombia',
    150.00,
    250,
    ARRAY[
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
      'https://images.pexels.com/photos/2467285/pexels-photo-2467285.jpeg'
    ],
    ARRAY['WiFi', 'Bar', 'Sound System', 'Lighting', 'Catering Kitchen', 'Restrooms', 'Security'],
    demo_host_id,
    'active'
  WHERE NOT EXISTS (
    SELECT 1 FROM spaces WHERE address = 'Carrera 7 #71-21, Zona G, Bogotá, Colombia'
  );
END $$;