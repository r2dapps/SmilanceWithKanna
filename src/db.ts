import Dexie, { type EntityTable } from 'dexie';

export interface Letter {
  id?: number;
  date: string;
  title: string;
  content: string;
  mood: string;
}

const db = new Dexie('SmilanceDB') as Dexie & {
  letters: EntityTable<Letter, 'id'>;
};

db.version(1).stores({
  letters: '++id, date, title, mood'
});

export { db };
