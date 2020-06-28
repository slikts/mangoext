import {browser} from 'webextension-polyfill-ts';
import poll from './poll';

browser.alarms.onAlarm.addListener(poll);

browser.runtime.onInstalled.addListener(() => {
  poll();
  browser.alarms.create('poll', {periodInMinutes: 25});
});
browser.runtime.onStartup.addListener(poll);
