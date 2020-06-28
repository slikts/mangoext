import axios from 'axios';
import db from '../db';

export const baseUrl = 'https://www.readmng.com/latest-releases';

const poll = async (page = 1) => {
  const url = page === 1 ? baseUrl : `${baseUrl}/${page}`;
  
  console.log('polling', url);

  const html = (await axios.get(url)).data;
  const parser = new DOMParser();
  const document = parser.parseFromString(html, 'text/html');
  
  db.storeUpdates(document);
};

export default poll;
