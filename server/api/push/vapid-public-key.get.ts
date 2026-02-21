export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  return { key: config.public.vapidPublicKey }
})
