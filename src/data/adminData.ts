export type LeadStatus = 'new' | 'contacted' | 'converted' | 'lost'
export type OrderStatus = 'active' | 'paused' | 'cancelled' | 'pending'

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  building: string
  unit: string
  date: string
  status: LeadStatus
  cut?: string
}

export interface Order {
  id: string
  customer: string
  email: string
  building: string
  unit: string
  cut: string
  price: number
  status: OrderStatus
  startDate: string
  nextDelivery: string
}

export interface AdminProduct {
  id: string
  name: string
  grade: string
  detail: string
  price: number
  img: string
  available: boolean
}

export const MOCK_LEADS: Lead[] = [
  { id: 'L001', name: 'James Hartley',   email: 'james@example.com',    phone: '+1 (713) 555-0182', building: 'Aspire Post Oak',              unit: '2204', date: '2026-04-05', status: 'new',       cut: 'Tomahawk' },
  { id: 'L002', name: 'Sofia Reyes',     email: 'sofia@example.com',    phone: '+1 (713) 555-0291', building: 'The Driscoll',                 unit: '1502', date: '2026-04-04', status: 'contacted', cut: 'A5 Wagyu' },
  { id: 'L003', name: 'Marcus Chen',     email: 'marcus@example.com',   phone: '+1 (713) 555-0374', building: 'Market Square Tower',          unit: '3801', date: '2026-04-03', status: 'converted', cut: 'Ribeye' },
  { id: 'L004', name: 'Ava Thompson',    email: 'ava@example.com',      phone: '+1 (713) 555-0455', building: 'Parkside at Discovery Green',  unit: '0912', date: '2026-04-02', status: 'new',       cut: 'Filet Mignon' },
  { id: 'L005', name: 'Daniel Kim',      email: 'daniel@example.com',   phone: '+1 (713) 555-0538', building: 'Elev8 Downtown',               unit: '1107', date: '2026-04-01', status: 'contacted', cut: 'Tomahawk' },
  { id: 'L006', name: 'Isabella Moore',  email: 'isabella@example.com', phone: '+1 (713) 555-0617', building: 'Hanover Autry Park',           unit: '0703', date: '2026-03-31', status: 'lost' },
  { id: 'L007', name: 'Ethan Walker',    email: 'ethan@example.com',    phone: '+1 (713) 555-0729', building: 'Aspire Post Oak',              unit: '3310', date: '2026-03-30', status: 'new',       cut: 'A5 Wagyu' },
  { id: 'L008', name: 'Mia Johnson',     email: 'mia@example.com',      phone: '+1 (713) 555-0846', building: 'The Driscoll',                 unit: '2801', date: '2026-03-29', status: 'converted', cut: 'Ribeye' },
  { id: 'L009', name: 'Oliver Davis',    email: 'oliver@example.com',   phone: '+1 (713) 555-0923', building: 'Market Square Tower',          unit: '2205', date: '2026-03-28', status: 'new',       cut: 'Filet Mignon' },
  { id: 'L010', name: 'Chloe Martinez',  email: 'chloe@example.com',    phone: '+1 (713) 555-1011', building: 'Elev8 Downtown',               unit: '0801', date: '2026-03-27', status: 'contacted', cut: 'A5 Wagyu' },
]

export const MOCK_ORDERS: Order[] = [
  { id: 'ORD-001', customer: 'Marcus Chen',    email: 'marcus@example.com',  building: 'Market Square Tower',         unit: '3801', cut: 'Ribeye',       price: 89,  status: 'active',    startDate: '2026-03-01', nextDelivery: '2026-05-01' },
  { id: 'ORD-002', customer: 'Mia Johnson',    email: 'mia@example.com',     building: 'The Driscoll',                unit: '2801', cut: 'Ribeye',       price: 89,  status: 'active',    startDate: '2026-03-01', nextDelivery: '2026-05-01' },
  { id: 'ORD-003', customer: 'Rachel Torres',  email: 'rachel@example.com',  building: 'Aspire Post Oak',             unit: '1405', cut: 'A5 Wagyu',     price: 189, status: 'active',    startDate: '2026-02-01', nextDelivery: '2026-05-01' },
  { id: 'ORD-004', customer: 'Noah Wilson',    email: 'noah@example.com',    building: 'Parkside at Discovery Green', unit: '0601', cut: 'Tomahawk',     price: 229, status: 'paused',    startDate: '2026-01-01', nextDelivery: '—' },
  { id: 'ORD-005', customer: 'Grace Lee',      email: 'grace@example.com',   building: 'Elev8 Downtown',              unit: '2002', cut: 'Filet Mignon', price: 119, status: 'active',    startDate: '2026-02-01', nextDelivery: '2026-05-01' },
  { id: 'ORD-006', customer: 'Liam Brown',     email: 'liam@example.com',    building: 'Hanover Autry Park',          unit: '0405', cut: 'A5 Wagyu',     price: 189, status: 'cancelled', startDate: '2026-01-01', nextDelivery: '—' },
  { id: 'ORD-007', customer: 'Emma Davis',     email: 'emma@example.com',    building: 'The Driscoll',                unit: '1904', cut: 'Tomahawk',     price: 229, status: 'pending',   startDate: '—',          nextDelivery: '2026-05-01' },
  { id: 'ORD-008', customer: 'William Taylor', email: 'will@example.com',    building: 'Aspire Post Oak',             unit: '0506', cut: 'Filet Mignon', price: 119, status: 'active',    startDate: '2026-02-01', nextDelivery: '2026-05-01' },
  { id: 'ORD-009', customer: 'Sophia Harris',  email: 'sophia@example.com',  building: 'Market Square Tower',         unit: '1102', cut: 'A5 Wagyu',     price: 189, status: 'active',    startDate: '2026-01-01', nextDelivery: '2026-05-01' },
  { id: 'ORD-010', customer: 'Henry Clark',    email: 'henry@example.com',   building: 'Elev8 Downtown',              unit: '3301', cut: 'Ribeye',       price: 89,  status: 'paused',    startDate: '2026-02-01', nextDelivery: '—' },
]

export const INITIAL_PRODUCTS: AdminProduct[] = [
  { id: 'p1', name: 'Ribeye',       grade: 'USDA Prime', detail: '16oz bone-in · 21-day dry-aged',        price: 89,  img: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&q=80&fit=crop&crop=center', available: true },
  { id: 'p2', name: 'Filet Mignon', grade: 'USDA Prime', detail: '8oz center-cut tenderloin',              price: 119, img: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&q=80&fit=crop&crop=center', available: true },
  { id: 'p3', name: 'A5 Wagyu',     grade: 'A5 Wagyu',   detail: '12oz Japanese Miyazaki striploin',      price: 189, img: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80&fit=crop&crop=center', available: true },
  { id: 'p4', name: 'Tomahawk',     grade: 'Heritage',   detail: '40oz long-bone cowboy cut',              price: 229, img: 'https://images.pexels.com/photos/12261087/pexels-photo-12261087.jpeg?auto=compress&cs=tinysrgb&w=400', available: true },
]
