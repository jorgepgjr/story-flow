import { Script, User } from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Jorge',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jorge',
  role: 'author'
};

export const MOCK_USERS: Record<string, User> = {
  'u1': CURRENT_USER,
  'u2': {
    id: 'u2',
    name: 'Ana (Revisora)',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
    role: 'reviewer'
  },
  'u3': {
    id: 'u3',
    name: 'Carlos (Produtor de Áudio)',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    role: 'producer'
  }
};

export const MOCK_SCRIPTS: Script[] = [
  {
    id: 's1',
    title: 'O Sussurro na Floresta',
    synopsis: 'Um detetive investiga sons misteriosos que levam a uma descoberta além da imaginação.',
    status: 'draft',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    authorId: 'u1',
    versions: [
      {
        id: 'v1',
        versionNumber: '1.0',
        content: 'O vento uivava através dos pinheiros antigos. Detetive Costa apertou seu casaco. Algo não estava certo. Ele podia ouvir... murmúrios.',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        authorId: 'u1',
      }
    ],
    comments: [],
  },
  {
    id: 's2',
    title: 'Café Quântico',
    synopsis: 'Uma cafeteria serve bebidas que permitem aos clientes reviver seu dia favorito.',
    status: 'review',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
    authorId: 'u1',
    versions: [
      {
        id: 'v2_1',
        versionNumber: '1.0',
        content: 'O cheiro de espresso era forte. Julia pediu o "Especial de Quinta". Ela fechou os olhos e, de repente, estava de volta a 2012.',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        authorId: 'u1',
      },
      {
        id: 'v2_2',
        versionNumber: '1.1',
        content: 'O cheiro de grãos torrados de espresso tomava o ar. Julia hesitou antes de pedir o "Especial de Quinta". Com o primeiro gole, ela sentiu a vertigem. Abriu os olhos e o calendário mostrava 2012.',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        authorId: 'u1',
      }
    ],
    comments: [
      {
        id: 'c1',
        userId: 'u2',
        text: 'A imersão do primeiro parágrafo melhorou muito na v1.1. Só preste atenção ao ritmo na hora de gravar a narração: a pausa antes de "Abriu os olhos" será fundamental.',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        resolved: false,
      }
    ],
  },
  {
    id: 's3',
    title: 'Estrela Guia',
    synopsis: 'Breve reflexão sobre navegação e astronomia antigas.',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    authorId: 'u2',
    versions: [
      {
        id: 'v3_1',
        versionNumber: '1.0',
        content: 'Os marinheiros olhavam para cima. A bússola era importante, mas a estrela do norte era a salvação.',
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        authorId: 'u2',
      }
    ],
    comments: [
      {
        id: 'c2',
        userId: 'u1',
        text: 'Concordo com a visão! Texto pronto.',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        resolved: true,
      }
    ],
  }
];
