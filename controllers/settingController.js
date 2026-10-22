import Setting from '../models/Setting.js'
import { invalidateSettingsCache } from '../utils/seoHelper.js'

export const getPublicSettings = async (req, res, next) => {
  try {
    const settings = await Setting.getAll()
    res.json({ success: true, data: settings })
  } catch (error) {
    next(error)
  }
}

export const updateSettingsAdmin = async (req, res, next) => {
  try {
    const settings = req.body
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ' })
    }
    await Setting.setMany(settings)
    invalidateSettingsCache()
    res.json({ success: true, message: 'Lưu cài đặt thành công' })
  } catch (error) {
    next(error)
  }
}
