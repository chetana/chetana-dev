import { Storage } from '@google-cloud/storage'

export function getGcsStorage(): Storage {
  const credentials = JSON.parse(process.env.GCS_SERVICE_ACCOUNT_JSON!)
  // Vercel env vars can store \n as literal two chars — normalize to real newlines
  credentials.private_key = credentials.private_key.replace(/\\n/g, '\n')
  return new Storage({ credentials })
}

export function getGcsBucket() {
  return getGcsStorage().bucket(process.env.GCS_BUCKET_NAME!)
}
