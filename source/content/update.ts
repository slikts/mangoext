import { setupTextarea } from './editor';

export const update = () => {
  const textarea = document.querySelector<HTMLTextAreaElement>('#updateForm textarea[name=event]');

  if (!textarea) {
    return;
  }

  setupTextarea(textarea, {
    onClose,
    isUpdate,
  });
};

const onClose = (textarea: HTMLTextAreaElement) => {
  textarea.closest('form')!.querySelector<HTMLSelectElement>('select[name="event_format"]')!.value = 'preformatted';
};

const pathname = window?.location.pathname;
const isUpdate = pathname === '/update.bml';
const isEdit = pathname === '/editjournal.bml';
if (isUpdate || isEdit) {
  update();
}
