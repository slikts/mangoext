// import './update.ts';
// import './comment.ts';

// const setupLink = (anchor: HTMLAnchorElement) => {
//   const url = new URL(anchor.getAttribute('href')!);
//   if (!/^(\/users\/|~)/.test(url.pathname)) {
//     return;
//   }

//   url.searchParams.set('style', 'mine');
//   anchor.setAttribute('href', String(url));
// };

// const linkSelector = 'a[href^="http://klab.lv/"]';
const main = () => {
  // const links = document.querySelectorAll<HTMLAnchorElement>(linkSelector);
  // links.forEach(setupLink);
  console.log('main')
};

main();

export {};
