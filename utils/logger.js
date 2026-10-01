import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const logDir = path.join(__dirname, '..', 'logs')

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

const getTimestamp = () => new Date().toISOString()

export const logger = {
  info: (msg, data = '') => {
    const formatted = `[INFO] [${getTimestamp()}] ${msg} ${data ? JSON.stringify(data) : ''}`
    console.log(formatted)
    fs.appendFileSync(path.join(logDir, 'app.log'), formatted + '\n')
  },
  warn: (msg, data = '') => {
    const formatted = `[WARN] [${getTimestamp()}] ${msg} ${data ? JSON.stringify(data) : ''}`
    console.warn(formatted)
    fs.appendFileSync(path.join(logDir, 'app.log'), formatted + '\n')
  },
  error: (msg, error = '') => {
    const errorMsg = error instanceof Error ? error.stack || error.message : error
    const formatted = `[ERROR] [${getTimestamp()}] ${msg} ${errorMsg ? JSON.stringify(errorMsg) : ''}`
    console.error(formatted)
    fs.appendFileSync(path.join(logDir, 'error.log'), formatted + '\n')
  },
}

export default logger
