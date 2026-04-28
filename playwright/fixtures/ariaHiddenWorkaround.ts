// PatternFly's Modal.toggleSiblingsFromScreenReaders sets aria-hidden="true"
// on all direct children of document.body during componentDidUpdate. Popper-based
// dropdowns (Select, Menu) portal their content to document.body as direct
// children. When the Modal re-renders after a dropdown opens, the menu gets
// aria-hidden="true", making it invisible to Playwright's getByRole.
//
// This fixture installs a MutationObserver that automatically strips
// aria-hidden="true" from any body-level element that is or contains a
// PatternFly menu (.pf-v6-c-menu).
import { test as base } from '@playwright/test';

export type AriaHiddenWorkaroundFixture = {
  ariaHiddenWorkaround: void;
};

export const test = base.extend<AriaHiddenWorkaroundFixture>({
  ariaHiddenWorkaround: [
    async ({ page }, use) => {
      await page.addInitScript(() => {
        const strip = (el: Element) => {
          if (
            el.getAttribute('aria-hidden') === 'true' &&
            (el.matches('.pf-v6-c-menu') || el.querySelector('.pf-v6-c-menu'))
          ) {
            el.removeAttribute('aria-hidden');
          }
        };

        const observer = new MutationObserver((mutations) => {
          for (const m of mutations) {
            if (
              m.type === 'attributes' &&
              m.target.parentElement === document.body
            ) {
              strip(m.target as Element);
            }
            if (m.type === 'childList') {
              for (const node of m.addedNodes) {
                if (node instanceof Element) strip(node);
              }
            }
          }
        });

        const init = () => {
          observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['aria-hidden'],
            childList: true,
            subtree: true,
          });
        };

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (document.body) {
          init();
        } else {
          document.addEventListener('DOMContentLoaded', init);
        }
      });

      await use(undefined);
    },
    { auto: true },
  ],
});
