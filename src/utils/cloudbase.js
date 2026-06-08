import cloudbase from '@cloudbase/js-sdk'
import { CLOUDBASE_ENV_ID } from './constants'

let app = null
let initPromise = null

export async function getCloudApp() {
  if (app) return app
  if (!initPromise) {
    initPromise = (async () => {
      const instance = cloudbase.init({
        env: CLOUDBASE_ENV_ID,
        region: 'ap-shanghai',
      })
      const auth = instance.auth({ persistence: 'local' })
      const loginState = await auth.getLoginState()
      if (!loginState) {
        await auth.signInAnonymously()
      }
      app = instance
      return instance
    })()
  }
  return initPromise
}

export async function getDatabase() {
  const cloudApp = await getCloudApp()
  return cloudApp.database()
}

export async function getStorageApp() {
  return getCloudApp()
}
