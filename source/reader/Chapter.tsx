/** @jsx jsx */
import { memo } from 'react';
import { jsx, css } from '@emotion/core';
import { useTheme } from 'emotion-theming';

import { Chapter as ChapterModel } from '../db';

const Chapter = ({ url, title, chapter, subbed, series, addSub, removeSub }: Props) => {
  const theme = useTheme<any>();
  const handle = () => {
    if (subbed && confirm(`Unsubscribe from ${title}?`)) {
      removeSub(series)
    } else {
      addSub(series)
    }
  }

  return (
    <tr
    >
      <td
      >
      <a href={`${url}/all-pages`} target="_blank" rel="noreferrer noopener"
        css={css`
        overflow: hidden;
        white-space: nowrap;
        width: 400px;
        text-overflow: ellipsis;
        display: block;
        margin: 1px 0;
        &:hover {
          background: rgba(255, 255, 255, 0.01);
        }
      `}
      
      >
        {title}
        </a>
      </td>
      <td css={css`
      text-align: right;
      `}>
        {chapter}
      </td>

      <td>
        <input type="checkbox" checked={subbed} onChange={handle} />
      </td>
  </tr>
  );
};

export default memo(Chapter);

type Props = ChapterModel & any;
