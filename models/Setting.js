import pool from '../config/db.js'

export class Setting {
  static async getAll() {
    const [rows] = await pool.query('SELECT setting_key, setting_value, setting_group FROM system_settings')
    const settings = {}
    rows.forEach(r => {
      settings[r.setting_key] = r.setting_value
    })
    return settings
  }

  static async getByGroup(group) {
    const [rows] = await pool.execute('SELECT setting_key, setting_value FROM system_settings WHERE setting_group = ?', [group])
    const settings = {}
    rows.forEach(r => {
      settings[r.setting_key] = r.setting_value
    })
    return settings
  }

  static async setMany(settingsObject) {
    for (const [key, value] of Object.entries(settingsObject)) {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '')
      await pool.execute(
        'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [key, stringValue, stringValue]
      )
    }
    return true
  }

  static async setOne(key, value, group = 'general') {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '')
    await pool.execute(
      'INSERT INTO system_settings (setting_key, setting_value, setting_group) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
      [key, stringValue, group, stringValue]
    )
    return true
  }
}

export default Setting
