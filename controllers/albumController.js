import Album from '../models/Album.js'
import Photo from '../models/Photo.js'

export const getPublicAlbums = async (req, res, next) => {
  try {
    const { category } = req.query
    const albums = await Album.getAll({ category })
    res.json({ success: true, data: albums })
  } catch (error) {
    next(error)
  }
}

export const getPublicAlbumBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params
    const album = await Album.getBySlug(slug)
    if (!album) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy album' })
    }
    res.json({ success: true, data: album })
  } catch (error) {
    next(error)
  }
}

export const getAlbumByIdAdmin = async (req, res, next) => {
  try {
    const { id } = req.params
    const album = await Album.getById(id)
    if (!album) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy album' })
    }
    res.json({ success: true, data: album })
  } catch (error) {
    next(error)
  }
}

export const createAlbum = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      category,
      category_label,
      cover_image,
      description,
      location,
      date_shot,
      package_name,
      story,
      is_featured,
      sort_order,
    } = req.body

    if (!title || !slug) {
      return res.status(400).json({ success: false, message: 'Tiêu đề và đường dẫn (slug) là bắt buộc' })
    }

    const album = await Album.create({
      title,
      slug,
      category: category || 'all',
      category_label: category_label || '',
      cover_image: cover_image || null,
      description: description || null,
      location: location || null,
      date_shot: date_shot || null,
      package_name: package_name || null,
      story: story || null,
      is_featured: is_featured !== false && is_featured !== 0,
      sort_order: Number(sort_order) || 0,
    })

    res.json({ success: true, message: 'Tạo album thành công', data: album })
  } catch (error) {
    next(error)
  }
}

export const updateAlbum = async (req, res, next) => {
  try {
    const { id } = req.params
    const {
      title,
      slug,
      category,
      category_label,
      cover_image,
      description,
      location,
      date_shot,
      package_name,
      story,
      is_featured,
      sort_order,
    } = req.body

    await Album.update(id, {
      title,
      slug,
      category: category || 'all',
      category_label: category_label || '',
      cover_image: cover_image || null,
      description: description || null,
      location: location || null,
      date_shot: date_shot || null,
      package_name: package_name || null,
      story: story || null,
      is_featured: is_featured !== false && is_featured !== 0,
      sort_order: Number(sort_order) || 0,
    })

    res.json({ success: true, message: 'Cập nhật album thành công' })
  } catch (error) {
    next(error)
  }
}

export const deleteAlbum = async (req, res, next) => {
  try {
    const { id } = req.params
    await Album.delete(id)
    res.json({ success: true, message: 'Xóa album thành công' })
  } catch (error) {
    next(error)
  }
}

export const addPhotoToAlbum = async (req, res, next) => {
  try {
    const { id } = req.params
    const { filename, original_name, size, url, title, description, sort_order } = req.body
    if (!url) {
      return res.status(400).json({ success: false, message: 'Đường dẫn ảnh là bắt buộc' })
    }
    const photo = await Photo.create({
      album_id: id,
      filename: filename || 'photo.webp',
      original_name,
      size,
      url,
      title,
      description,
      sort_order: Number(sort_order) || 0,
    })
    res.json({ success: true, message: 'Thêm ảnh thành công', data: photo })
  } catch (error) {
    next(error)
  }
}

export const addPhotosBatchToAlbum = async (req, res, next) => {
  try {
    const { id } = req.params
    const { photos } = req.body
    if (!Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({ success: false, message: 'Danh sách ảnh không hợp lệ' })
    }
    const formatted = photos.map((p, idx) => ({
      album_id: id,
      filename: p.filename || 'photo.webp',
      original_name: p.original_name || p.originalname || '',
      size: p.size || 0,
      url: p.url,
      title: p.title || (p.original_name ? p.original_name.replace(/\.[^/.]+$/, '') : `Ảnh ${idx + 1}`),
      description: p.description || '',
      sort_order: Number(p.sort_order) || (idx + 1),
    }))
    await Photo.createMany(formatted)
    res.json({ success: true, message: `Đã thêm ${formatted.length} ảnh vào album thành công` })
  } catch (error) {
    next(error)
  }
}

export const deletePhoto = async (req, res, next) => {
  try {
    const { photoId } = req.params
    await Photo.delete(photoId)
    res.json({ success: true, message: 'Xóa ảnh thành công' })
  } catch (error) {
    next(error)
  }
}
