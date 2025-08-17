export function createPageUrl(
  page: string,
  params?: Record<string, string | number | boolean>
): string {
  let url = `/${page}`;
  if (params && Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(
      Object.entries(params).reduce<Record<string, string>>(
        (acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        },
        {}
      )
    ).toString();
    url += `?${queryString}`;
  }
  return url;
}
