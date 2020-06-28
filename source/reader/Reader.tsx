/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { memo, useEffect, useState, useMemo, useCallback } from 'react';
import { produce } from 'immer';
import { useTheme } from 'emotion-theming';
import Chapter from "./Chapter";

import db, { Chapter as ChapterModel } from '../db';

const Reader = ({ }: Props) => {
  const [chapters, setChapters] = useState<ChapterModel[]>([]);
  const theme = useTheme<any>();

  const [subs, addSub, removeSub] = useSubs()
  const _subs = subs.split(',');

  const [showAll, setShowAll] = useState<boolean>(false);

  useEffect(() => {
    const _subs = subs.split(',');
    const posts = (showAll ?
      db.posts :
      db.posts
      .where('series')
      .anyOf(_subs))
      .reverse()
      .toArray()

    posts.then(setChapters)

    db.onCreated((item) => {
      setChapters((oldPosts) => {
        return produce(oldPosts, (draft) => {
          draft.unshift(item);
        });
      });
    });
  }, [setChapters, showAll, subs]);


  const toggleShow = () => {
    setShowAll(!showAll);
  }

    return (
    <div>
      <div
        css={css`
          --width: 500px;
          // width: var(--width);
          @media screen and (max-width: 500px) {
            max-width: calc(100% - ${theme.space[2] * 2}px);
          }
          img {
            max-width: 100%;
          }
        `}
        >
          <label htmlFor="show-all">Show all
          <input type="checkbox" id="show-all" checked={showAll} onChange={toggleShow} />
            </label>
          <table css={css`
          th {
            padding: 0 2px;
          }`}>
            <thead>
              <tr>
                <th css={css`
                text-align: left`}>
                  Series
                </th>
                <th>
                  Chapter
                </th>
                <th>
                  Subbed
                </th>
            </tr>
            </thead>
            <tbody>
          {chapters.map((chapter) => {
            return (
              <Chapter {...chapter} key={chapter.url}
                subbed={_subs.includes(chapter.series)}
                addSub={addSub}
                removeSub={removeSub}/>
            );
          })}
              </tbody>
          </table>
      </div>
    </div>
  );
};

export default memo(Reader);

type Props = any;

const useSubs = () => {
  const [subs, setSubs] = useState<string>('');

  useEffect(() => {
      getSubs(setSubs)
    });

  const removeSub = useCallback((sub: string) => {
    getSubs((subs: string) => {
      const subSet = new Set(subs.split(','));
      subSet.delete(sub)
      const newSubs = Array.from(subSet).join(',')
      saveSubs(newSubs);
      setSubs(newSubs);
    })
  }, [setSubs]);

  const addSub = useCallback((sub: string) => {
    console.log(sub);
    
    getSubs((subs: string) => {
      const subSet = new Set(subs.split(','));
      subSet.add(sub)
      const newSubs = Array.from(subSet).join(',')
      saveSubs(newSubs);
      setSubs(newSubs);
    })
  }, [setSubs]);
  
  console.log(subs);

  return [subs, addSub, removeSub] as const;
}

const getSubs = (cb: any) => {
  chrome.storage.sync.get(['subs'], ({ subs }: any) => { cb(subs || '') });
}
const saveSubs = (subs: any) => {
  chrome.storage.sync.set({ subs })
}
