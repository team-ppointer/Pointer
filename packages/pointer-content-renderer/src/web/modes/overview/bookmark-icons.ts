export const BOOKMARK_ICON_INACTIVE =
  '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.8327 17.5L9.99935 14.1667L4.16602 17.5V4.16667C4.16602 3.72464 4.34161 3.30072 4.65417 2.98816C4.96673 2.67559 5.39065 2.5 5.83268 2.5H14.166C14.608 2.5 15.032 2.67559 15.3445 2.98816C15.6571 3.30072 15.8327 3.72464 15.8327 4.16667V17.5Z" stroke="#9FA4AE" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export const BOOKMARK_ICON_ACTIVE =
  '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.8346 17.5L10.0013 14.1667L4.16797 17.5V4.16667C4.16797 3.72464 4.34356 3.30072 4.65612 2.98816C4.96868 2.67559 5.39261 2.5 5.83464 2.5H14.168C14.61 2.5 15.0339 2.67559 15.3465 2.98816C15.659 3.30072 15.8346 3.72464 15.8346 4.16667V17.5Z" fill="#617AF9" stroke="#617AF9" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export function setBookmarkButtonState(btn: HTMLElement, bookmarked: boolean): void {
  btn.classList.toggle('bookmark-btn--active', bookmarked);
  btn.classList.toggle('bookmark-btn--inactive', !bookmarked);
  btn.innerHTML = bookmarked ? BOOKMARK_ICON_ACTIVE : BOOKMARK_ICON_INACTIVE;
}
