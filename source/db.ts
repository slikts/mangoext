import Dexie from 'dexie';
import 'dexie-observable';
import parse from 'date-fns/parse'

export class Db extends Dexie {
  constructor() {
    super('mango');

    this.version(1).stores({
      posts: `url, series, chapter, date`,
    });

    this.open();
  }

  onCreated(handler: (item: Item) => void) {
    this.on('changes', (changes: any[]) => {
      changes.forEach(({ type, obj }) => {
        if (type === 1) {
          handler(obj);
        }
      });
    });
  }

  storeUpdates(document: Document) {
    const updates = Updates(document);
    console.log(updates);
    this.posts.bulkPut(updates);
  }
}

export interface Db {
  posts: Dexie.Table<Chapter, string>;
}

const db = new Db();

export default db;

export type Chapter = {
  url: string,
  series: string,
  chapter: string,
  title: string,
  date: Date,
};

export const Updates = (document: Document): Chapter[] => {
  const items = document.querySelectorAll('.manga_updates > dl')!
  return Array.from(items, item => {
    const timeString = item.querySelector('.time')!.textContent!;
    const date = parse(timeString, 'dd/MM/yyyy', new Date());

    const info = item.querySelector('.manga_info') as HTMLAnchorElement;
    const { title, href: series } = info;

    return Array.from(item.querySelectorAll('dd a') as any, (a: HTMLAnchorElement) => {
      return Chapter(a, date, series, title)
    })
  }).flat();
}

export const Chapter = (a: HTMLAnchorElement, date: Date, series: string, title: string): Chapter => {
  const url = new URL(a.getAttribute('href')!);
  const [,, chapter] = url.pathname.split('/');
  return {
    url: url.href,
    series,
    chapter,
    title,
    date
  }
}
