export type PageSaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error'

export const PAGE_SAVE_STATUS_EVENT = 'gt-page-save-status'

export interface PageSaveStatusDetail {
  pageId: string
  status: PageSaveStatus
}

export function publishPageSaveStatus(detail: PageSaveStatusDetail) {
  window.dispatchEvent(new CustomEvent<PageSaveStatusDetail>(
    PAGE_SAVE_STATUS_EVENT,
    { detail },
  ))
}
