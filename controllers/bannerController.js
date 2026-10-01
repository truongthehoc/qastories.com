import Banner from '../models/Banner.js'

export const getPublicBanners = async (req, res, next) => {
  try {
    const banners = await Banner.getAll({ activeOnly: true })
    res.json({ success: true, data: banners })
  } catch (error) {
    next(error)
  }
}

export const getAllBannersAdmin = async (req, res, next) => {
  try {
    const banners = await Banner.getAll({ activeOnly: false })
    res.json({ success: true, data: banners })
  } catch (error) {
    next(error)
  }
}

export const createBanner = async (req, res, next) => {
  try {
    const { title, subtitle, image_url, link_url, button_text, sort_order, is_active } = req.body
    if (!image_url) {
      return res.status(400).json({ success: false, message: 'Đường dẫn ảnh banner là bắt buộc' })
    }
    const banner = await Banner.create({
      title,
      subtitle,
      image_url,
      link_url,
      button_text,
      sort_order: Number(sort_order) || 0,
      is_active: is_active !== false && is_active !== 0 && is_active !== '0',
    })
    res.json({ success: true, message: 'Tạo banner thành công', data: banner })
  } catch (error) {
    next(error)
  }
}

export const updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params
    const { title, subtitle, image_url, link_url, button_text, sort_order, is_active } = req.body
    await Banner.update(id, {
      title,
      subtitle,
      image_url,
      link_url,
      button_text,
      sort_order: Number(sort_order) || 0,
      is_active: is_active !== false && is_active !== 0 && is_active !== '0',
    })
    res.json({ success: true, message: 'Cập nhật banner thành công' })
  } catch (error) {
    next(error)
  }
}

export const toggleBannerActive = async (req, res, next) => {
  try {
    const { id } = req.params
    const { is_active } = req.body
    await Banner.toggleActive(id, is_active)
    res.json({ success: true, message: 'Cập nhật trạng thái thành công' })
  } catch (error) {
    next(error)
  }
}

export const deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params
    await Banner.delete(id)
    res.json({ success: true, message: 'Xóa banner thành công' })
  } catch (error) {
    next(error)
  }
}
