import Advertisement from '../models/Advertisement.js'

export const getPublicAdvertisements = async (req, res, next) => {
  try {
    const { placement, page } = req.query
    const ads = await Advertisement.getAll({ activeOnly: true, placement, page })
    res.json({ success: true, data: ads })
  } catch (error) {
    next(error)
  }
}

export const getAllAdvertisementsAdmin = async (req, res, next) => {
  try {
    const ads = await Advertisement.getAll({ activeOnly: false })
    res.json({ success: true, data: ads })
  } catch (error) {
    next(error)
  }
}

export const createAdvertisement = async (req, res, next) => {
  try {
    const {
      title,
      description,
      media_type,
      media_url,
      media_thumbnail,
      link_url,
      button_text,
      placement,
      target_pages,
      popup_delay,
      popup_duration,
      popup_frequency,
      start_date,
      end_date,
      sort_order,
      is_active,
    } = req.body

    if (!title || !media_url) {
      return res.status(400).json({
        success: false,
        message: 'Tiêu đề và đường dẫn hình ảnh/video là bắt buộc.',
      })
    }

    const newAd = await Advertisement.create({
      title,
      description,
      media_type: media_type || 'image',
      media_url,
      media_thumbnail,
      link_url,
      button_text: button_text || 'Xem Ngay',
      placement: placement || 'popup',
      target_pages: target_pages || 'all',
      popup_delay: popup_delay !== undefined ? parseInt(popup_delay, 10) : 3,
      popup_duration: popup_duration !== undefined ? parseInt(popup_duration, 10) : 0,
      popup_frequency: popup_frequency || 'once_per_session',
      start_date,
      end_date,
      sort_order: sort_order !== undefined ? parseInt(sort_order, 10) : 0,
      is_active: is_active !== undefined ? (is_active ? 1 : 0) : 1,
    })

    res.status(201).json({
      success: true,
      message: 'Tạo quảng cáo thành công.',
      data: newAd,
    })
  } catch (error) {
    next(error)
  }
}

export const updateAdvertisement = async (req, res, next) => {
  try {
    const { id } = req.params
    const updated = await Advertisement.update(id, req.body)
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy quảng cáo.' })
    }
    res.json({
      success: true,
      message: 'Cập nhật quảng cáo thành công.',
      data: updated,
    })
  } catch (error) {
    next(error)
  }
}

export const toggleAdvertisementActive = async (req, res, next) => {
  try {
    const { id } = req.params
    const updated = await Advertisement.toggleActive(id)
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy quảng cáo.' })
    }
    res.json({
      success: true,
      message: `Đã ${updated.is_active ? 'bật' : 'tắt'} quảng cáo thành công.`,
      data: updated,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteAdvertisement = async (req, res, next) => {
  try {
    const { id } = req.params
    const success = await Advertisement.delete(id)
    if (!success) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy quảng cáo.' })
    }
    res.json({
      success: true,
      message: 'Xóa quảng cáo thành công.',
    })
  } catch (error) {
    next(error)
  }
}

export const trackView = async (req, res, next) => {
  try {
    const { id } = req.params
    await Advertisement.trackView(id)
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

export const trackClick = async (req, res, next) => {
  try {
    const { id } = req.params
    await Advertisement.trackClick(id)
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}
