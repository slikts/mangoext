/** @jsx jsx */
import { useCallback, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Stackedit from 'stackedit-js';
import TurndownService from 'turndown';
import { css, jsx } from '@emotion/core';

import StackeditIcon from '../assets/stackedit.svg';

export const setupTextarea = (textarea: HTMLTextAreaElement, props: any) => {
  const root = document.createElement('div');
  textarea.parentNode!.insertBefore(root, textarea);

  ReactDOM.render(<Button textarea={textarea} {...props} />, root);
};

const Button = ({ textarea, onClose, isUpdate }: Props) => {
  const handleOpen = useCallback(() => {
    const stackedit = new Stackedit();

    stackedit.openFile({
      content: {
        text: turndownService.turndown(textarea.value || ''),
      },
    });

    stackedit.on('fileChange', (file: any) => {
      const html = unescape(file.content.html);
      textarea.value = html;
      if (isUpdate) {
        window.localStorage.setItem('draft', html);
      }
    });

    stackedit.on('close', () => {
      textarea.value = textarea.value || '';
      if (onClose) {
        onClose(textarea);
      }
    });
  }, [textarea, onClose, isUpdate]);

  const ref = useRef<any>();

  useEffect(() => {
    ref.current!.appendChild(textarea);
    if (isUpdate) {
      const draft = window.localStorage.getItem('draft');

      if (!textarea.value && draft) {
        textarea.value = draft;
      }
    }
    if (isUpdate) {
      textarea.closest('form').addEventListener('submit', () => {
        window.localStorage.removeItem('draft');
      });
    }
  }, [textarea, isUpdate]);

  return (
    <div
      css={css`
        position: relative;
        textarea {
          box-sizing: border-box;
        }
        svg {
          display: block;
          height: 1rem;
          margin-right: 0.25rem;
        }
      `}
    >
      <button
        type="button"
        onClick={handleOpen}
        css={css`
          position: absolute;
          bottom: 100%;
          right: 0;
          display: flex;
        `}
      >
        <StackeditIcon />
        StackEdit
      </button>
      <div ref={ref} />
    </div>
  );
};

type Props = any;

const turndownService = new TurndownService({
  headingStyle: 'atx',
  linkStyle: 'referenced',
});

turndownService.keep(['del', 'ins', 'video', 'span']);

const unescape = (string: string) => {
  return string.replace(/&#(\d+);/g, (_, code) => {
    return String.fromCharCode(+code);
  });
};
