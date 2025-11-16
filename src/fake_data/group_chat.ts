// src/fake_data/group_chat.ts
export type GroupMember = {
  id: string;
  name: string;
  avatar: string;
  role?: string;
  online?: boolean;
};

export type GroupMsg = {
  id: string;
  senderId: string;
  type: 'text' | 'audio';
  text?: string;
  audioSec?: number;
  at: string;
};

export const GROUP_ME_ID = 'me';

export const groupMembers: GroupMember[] = [
  {
    id: GROUP_ME_ID,
    name: 'David Tran',
    avatar: 'https://randomuser.me/api/portraits/men/28.jpg',
    role: 'Design',
    online: true,
  },
  {
    id: 'u21',
    name: 'Linh Nguyen',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    role: 'Product',
    online: true,
  },
  {
    id: 'u22',
    name: 'Quang Pham',
    avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
    role: 'Backend',
  },
  {
    id: 'u23',
    name: 'Lena Vo',
    avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
    role: 'Marketing',
    online: true,
  },
  {
    id: 'u24',
    name: 'Bao Dang',
    avatar: 'https://randomuser.me/api/portraits/men/52.jpg',
    role: 'QA',
  },
];

export const groupMeta = {
  id: 'g42',
  name: 'Nhom Ra Mat SP',
  topic: 'Sprint 24 - Mobile banking',
  members: groupMembers,
};

const iso = (y: number, m: number, d: number, h = 9, min = 0) =>
  new Date(y, m - 1, d, h, min).toISOString();

export const groupMessagesSeed: GroupMsg[] = [
  {
    id: 'gm1',
    senderId: 'u21',
    type: 'text',
    text: 'Moi nguoi oi, nhac lai la 15h hop livestream nha.',
    at: iso(2025, 3, 24, 9, 5),
  },
  {
    id: 'gm2',
    senderId: GROUP_ME_ID,
    type: 'text',
    text: 'Ok Linh, minh vua update lai layout.',
    at: iso(2025, 3, 24, 9, 6),
  },
  {
    id: 'gm3',
    senderId: 'u22',
    type: 'text',
    text: 'API phan bao cao da san sang staging.',
    at: iso(2025, 3, 24, 9, 8),
  },
  {
    id: 'gm4',
    senderId: 'u23',
    type: 'text',
    text: 'Nice! Minh se chup lai banner luc 11h.',
    at: iso(2025, 3, 24, 9, 10),
  },
  {
    id: 'gm5',
    senderId: 'u24',
    type: 'audio',
    audioSec: 9,
    at: iso(2025, 3, 24, 9, 12),
  },
  {
    id: 'gm6',
    senderId: GROUP_ME_ID,
    type: 'text',
    text: 'Day la ban mau moi, moi nguoi xem duoc khong?',
    at: iso(2025, 3, 24, 9, 20),
  },
  {
    id: 'gm7',
    senderId: 'u21',
    type: 'text',
    text: 'Dep qua, minh vote 1.',
    at: iso(2025, 3, 24, 9, 21),
  },
  {
    id: 'gm8',
    senderId: 'u23',
    type: 'text',
    text: 'Chu y nhac minh deliver file PSD nhe.',
    at: iso(2025, 3, 24, 9, 23),
  },
  {
    id: 'gm9',
    senderId: 'u22',
    type: 'text',
    text: 'Trua nay ai ranh thi review bang test ho minh.',
    at: iso(2025, 3, 24, 11, 30),
  },
  {
    id: 'gm10',
    senderId: GROUP_ME_ID,
    type: 'text',
    text: 'Duoc, 13h minh co the tham gia.',
    at: iso(2025, 3, 24, 11, 32),
  },
  {
    id: 'gm11',
    senderId: 'u24',
    type: 'text',
    text: 'Cam on team, QA se tong hop bug truoc 17h.',
    at: iso(2025, 3, 24, 11, 35),
  },
];
