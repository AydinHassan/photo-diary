export function getPublicUrl(event: any, upload: { id: string; key: string }) {
  const base = process.dev
    ? '/api/image'
    : event.context.cloudflare.env.R2_PUBLIC_BASE

  // use id for local (api route expects id) and key for prod (direct URL)
  return process.dev
    ? `${base}/${upload.id}`
    : `${base}/${upload.key}`
}
