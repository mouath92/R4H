export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phoneNumber: string;
  role?: 'user' | 'host';
}

export interface Location {
  id: string;
  title: string;
  description: string;
  address: string;
  price: number;
  pricePerHour: number;
  images: string[];
  amenities: string[];
  host: User | null;  // Made host nullable
  rating: number;
  reviews: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  size: string;
  maxCapacity: number;
  status: 'active' | 'pending' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  locationId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalPrice: number;
  hours: number;
  paymentMethod: 'credit_card' | 'bank_transfer' | 'pse' | 'nequi';
  paymentStatus: 'pending' | 'paid' | 'failed';
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: Message;
  unreadCount: number;
}

export interface Review {
  id: string;
  userId: string;
  locationId: string;
  rating: number;
  comment: string;
  date: string;
}

export interface HostDashboardStats {
  totalBookings: number;
  totalRevenue: number;
  activeListings: number;
  averageRating: number;
}

export interface HostEarnings {
  period: string;
  amount: number;
  bookings: number;
}