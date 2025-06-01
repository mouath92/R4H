import { User } from '../types';

// Using proper UUIDs for user IDs
export const users: User[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'b2c3d4e5-f6a1-8901-2345-67890abcdef1',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'host',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Using a proper UUID for the current user
export const currentUser = users[0];

// Add the missing locations export matching our spaces table schema
export const locations = [
  {
    id: 'c3d4e5f6-a1b2-9012-3456-7890abcdef12',
    title: 'Modern Downtown Studio',
    description: 'A bright and spacious studio perfect for creative work',
    address: '123 Main St, Downtown',
    price_per_hour: 25.00,
    size_m2: 40,
    image_urls: [
      'https://images.pexels.com/photos/1090638/pexels-photo-1090638.jpeg',
      'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'
    ],
    amenities: ['WiFi', 'Air Conditioning', 'Standing Desk', 'Coffee Machine'],
    host_id: users[1].id,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'd4e5f6a1-b2c3-0123-4567-890abcdef123',
    title: 'Cozy Meeting Room',
    description: 'Professional meeting space in a prime location',
    address: '456 Business Ave, Midtown',
    price_per_hour: 35.00,
    size_m2: 30,
    image_urls: [
      'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg',
      'https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg'
    ],
    amenities: ['Projector', 'Whiteboard', 'Video Conference Setup', 'Water Dispenser'],
    host_id: users[1].id,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Add the missing bookings export matching our bookings table schema
export const bookings = [
  {
    id: 'e5f6a1b2-c3d4-1234-5678-90abcdef1234',
    user_id: users[0].id,
    space_id: locations[0].id,
    date: '2025-05-20',
    start_time: '09:00',
    end_time: '12:00',
    duration_hours: 3,
    total_price: 75.00,
    status: 'confirmed',
    created_at: new Date().toISOString()
  },
  {
    id: 'f6a1b2c3-d4e5-2345-6789-0abcdef12345',
    user_id: users[0].id,
    space_id: locations[1].id,
    date: '2025-05-21',
    start_time: '14:00',
    end_time: '16:00',
    duration_hours: 2,
    total_price: 70.00,
    status: 'pending',
    created_at: new Date().toISOString()
  },
  {
    id: 'a1b2c3d4-e5f6-3456-7890-abcdef123456',
    user_id: users[0].id,
    space_id: locations[0].id,
    date: '2025-05-15',
    start_time: '10:00',
    end_time: '13:00',
    duration_hours: 3,
    total_price: 75.00,
    status: 'completed',
    created_at: new Date().toISOString()
  }
];

// Add the missing messages export
export const messages = [
  {
    id: 'msg-1',
    senderId: users[0].id,
    receiverId: users[1].id,
    content: 'Hi, is the studio still available for tomorrow?',
    timestamp: new Date().toISOString(),
    read: true
  },
  {
    id: 'msg-2',
    senderId: users[1].id,
    receiverId: users[0].id,
    content: 'Yes, it is! What time were you thinking?',
    timestamp: new Date().toISOString(),
    read: true
  }
];

// Add the missing conversations export
export const conversations = [
  {
    id: 'conv-1',
    participants: [users[0].id, users[1].id],
    lastMessage: messages[1],
    unreadCount: 0,
    updatedAt: new Date().toISOString()
  }
];