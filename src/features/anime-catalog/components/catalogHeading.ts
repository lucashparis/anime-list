const CATALOG_HEADING_ID = 'catalog-heading';

export const CATALOG_HEADING_PROPS = { id: CATALOG_HEADING_ID, tabIndex: -1 } as const;

export function focusCatalogHeading() {
  document.getElementById(CATALOG_HEADING_ID)?.focus();
}
