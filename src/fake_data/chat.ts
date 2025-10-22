// src/fake_data/chat.ts
export type User = {
  id: string;
  name: string;
  avatar: string;
  online?: boolean;
};

export type Conversation = {
  id: string;
  title: string;
  isGroup?: boolean;
  members: string[]; // user ids
  lastText: string;
  updatedAt: string; // ISO
  unread?: number;
  verified?: boolean;
};

export const users: User[] = [
  {
    id: 'u1',
    name: 'David',
    avatar: 'https://randomuser.me/api/portraits/men/11.jpg',
    online: true,
  },
  {
    id: 'u2',
    name: 'Nhóm 6',
    avatar:
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200',
  },
  {
    id: 'u3',
    name: 'Merry An.',
    avatar: 'https://randomuser.me/api/portraits/women/21.jpg',
    online: true,
  },
  {
    id: 'u4',
    name: 'John Walton',
    avatar: 'https://randomuser.me/api/portraits/men/31.jpg',
  },
  {
    id: 'u5',
    name: 'Monica Randawa',
    avatar: 'https://randomuser.me/api/portraits/women/41.jpg',
  },
  {
    id: 'u6',
    name: 'Innoxtent Jay',
    avatar: 'https://randomuser.me/api/portraits/men/51.jpg',
  },
  {
    id: 'u7',
    name: 'Harry Samit',
    avatar: 'https://randomuser.me/api/portraits/men/61.jpg',
  },
  {
    id: 'u8',
    name: 'Alex',
    avatar: 'https://randomuser.me/api/portraits/men/71.jpg',
    online: true,
  },
  {
    id: 'u9',
    name: 'Sara',
    avatar: 'https://randomuser.me/api/portraits/women/81.jpg',
    online: true,
  },
  {
    id: 'u10',
    name: 'Nick',
    avatar: 'https://randomuser.me/api/portraits/men/91.jpg',
  },
];

export const activeIds = ['u8', 'u9', 'u3', 'u4', 'u10'];

// base list (giống màn demo)
export const conversations: Conversation[] = [
  {
    id: 'c1',
    title: 'Nhóm 6',
    isGroup: true,
    members: ['u2', 'u1'],
    lastText: 'Hi, David. Hope you’re doing well…',
    updatedAt: '2025-03-29T09:15:00Z',
    unread: 2,
    verified: true,
  },
  {
    id: 'c2',
    title: 'Merry An.',
    members: ['u3', 'u1'],
    lastText: 'Are you ready for today’s party…',
    updatedAt: '2025-03-12T07:10:00Z',
  },
  {
    id: 'c3',
    title: 'John Walton',
    members: ['u4', 'u1'],
    lastText: 'I’m sending you a parcel rece…',
    updatedAt: '2025-02-08T16:20:00Z',
  },
  {
    id: 'c4',
    title: 'Monica Randawa',
    members: ['u5', 'u1'],
    lastText: 'Hope you’re doing well today…',
    updatedAt: '2025-02-02T13:05:00Z',
  },
  {
    id: 'c5',
    title: 'Innoxtent Jay',
    members: ['u6', 'u1'],
    lastText: 'Let’s get back to the work, You…',
    updatedAt: '2025-01-25T08:05:00Z',
  },
  {
    id: 'c6',
    title: 'Harry Samit',
    members: ['u7', 'u1'],
    lastText: 'Listen david, I have a problem…',
    updatedAt: '2025-01-18T11:25:00Z',
  },
];

// helper tạo ISO string lùi ngày
const daysAgoISO = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

// tạo thêm ~30 hội thoại giả để kéo scroll
const extra: Conversation[] = Array.from({length: 30}).map((_, i) => {
  const uid = (i % (users.length - 1)) + 2; // tránh u1
  const u = users[uid - 1];
  return {
    id: `c_extra_${i + 1}`,
    title: u.name,
    members: [u.id, 'u1'],
    lastText:
      i % 3 === 0
        ? 'Got your message, will reply soon…'
        : i % 3 === 1
        ? 'Ping me when you have time…'
        : 'Let’s sync after lunch today…',
    updatedAt: daysAgoISO(8 + i), // mỗi item lùi thêm 1 ngày
  };
});

// danh sách dùng trong màn hình
export const conversationsAll: Conversation[] = [...conversations, ...extra];
