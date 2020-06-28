import { setupTextarea } from './editor';

const url = new URL(String(window.location));

const onClose = (textarea: HTMLTextAreaElement) => {
  textarea.closest('form')!.querySelector<HTMLInputElement>('input[name="prop_opt_preformatted"]')!.checked = true;
};

if (url.searchParams.get('mode') === 'reply' || url.searchParams.has('replyto')) {
  setupTextarea(document.querySelector<HTMLTextAreaElement>('#commenttext')!, { onClose });
}
