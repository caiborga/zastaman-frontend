export function formatDate(slotProps: any): string {
  const value = slotProps.data[slotProps.fielsd];
  return value ? new Date(value).toLocaleDateString('de-DE') : '';
}