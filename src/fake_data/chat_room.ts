// src/fake_data/chat_room.ts
export type Msg = {
  id: string;
  type: 'text' | 'audio';
  fromMe?: boolean;
  text?: string;
  audioSec?: number;
  at: string; // ISO string
};

export const peer = {
  id: 'u2',
  name: 'Smith Mathew',
  role: 'Senior Dev',
  avatar:
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200',
  online: true,
};

// tiện tạo thời gian
const iso = (y: number, m: number, d: number, h = 9, min = 0) =>
  new Date(y, m - 1, d, h, min).toISOString();

// Một mớ dữ liệu giả bằng tiếng Việt
export const messagesSeed: Msg[] = [
  {
    id: 'm1',
    type: 'text',
    text: 'Bạn còn đang đi du lịch chứ?',
    at: iso(2022, 3, 24, 9, 10),
  },
  {
    id: 'm2',
    type: 'text',
    fromMe: true,
    text: 'Ừ, mình đang ở Istanbul nè..',
    at: iso(2022, 3, 24, 9, 11),
  },
  {
    id: 'm3',
    type: 'text',
    text: 'Ôi, nghe hay quá!',
    at: iso(2022, 3, 24, 9, 12),
  },
  {
    id: 'm4',
    type: 'text',
    text: 'Bên đó có mưa không??',
    at: iso(2022, 3, 24, 9, 13),
  },
  {
    id: 'm5',
    type: 'audio',
    audioSec: 7,
    fromMe: true,
    at: iso(2022, 3, 24, 9, 15),
  },

  // Chèn thêm nhiều block để có scroll dài
  {
    id: 'm6',
    type: 'text',
    text: 'Hôm qua mình vừa xem ảnh bạn đăng.',
    at: iso(2022, 3, 24, 10, 5),
  },
  {
    id: 'm7',
    type: 'text',
    text: 'Quán cà phê nhìn chill thật sự.',
    at: iso(2022, 3, 24, 10, 6),
  },
  {
    id: 'm8',
    type: 'text',
    fromMe: true,
    text: 'Không khí dễ chịu lắm.',
    at: iso(2022, 3, 24, 10, 7),
  },
  {
    id: 'm9',
    type: 'text',
    text: 'Nhớ mua ít quà nha 😄',
    at: iso(2022, 3, 24, 10, 8),
  },
  {id: 'm10', type: 'audio', audioSec: 10, at: iso(2022, 3, 24, 10, 10)},

  // ngày tiếp theo
  {
    id: 'm11',
    type: 'text',
    text: 'Chào buổi sáng!',
    at: iso(2022, 3, 25, 8, 0),
  },
  {
    id: 'm12',
    type: 'text',
    fromMe: true,
    text: 'Sáng nay ra biển nè.',
    at: iso(2022, 3, 25, 8, 2),
  },
  {
    id: 'm13',
    type: 'text',
    text: 'Nhớ chụp nhiều ảnh.',
    at: iso(2022, 3, 25, 8, 3),
  },
  {
    id: 'm14',
    type: 'text',
    text: 'Tớ họp buổi chiều.',
    at: iso(2022, 3, 25, 8, 4),
  },
  {
    id: 'm15',
    type: 'audio',
    audioSec: 12,
    fromMe: true,
    at: iso(2022, 3, 25, 8, 15),
  },

  // thêm vài ngày nữa
  {
    id: 'm16',
    type: 'text',
    text: 'Công ty chuẩn bị release.',
    at: iso(2022, 3, 26, 11, 10),
  },
  {
    id: 'm17',
    type: 'text',
    fromMe: true,
    text: 'Về kịp để join nha.',
    at: iso(2022, 3, 26, 11, 12),
  },
  {id: 'm18', type: 'text', text: 'Ok, mai gặp!', at: iso(2022, 3, 26, 11, 14)},
];
