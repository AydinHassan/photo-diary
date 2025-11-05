export function getPublicUrl(event: any, upload: { id: string; key: string }) {
  const base = process.dev
    ? '/api/image'
    : 'https://pub-fa37fe4a3c4f495997b4174ccf32a4e9.r2.dev'

  // use id for local (api route expects id) and key for prod (direct URL)
  return process.dev
    ? `${base}/${upload.id}`
    : `${base}/${upload.key}`
}
