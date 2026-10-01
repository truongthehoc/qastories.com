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

    if (!title || !slug || !category) {
      return res.status(400).json({ success: false, message: 'Tiêu đề, đường dẫn (slug) và danh mục là bắt buộc' })
    }

    const album = await Album.create({
      title,
      slug,
      category,
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
      category,
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
      filename: filename || 'photo.jpg',
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

export const deletePhoto = async (req, res, next) => {
  try {
    const { photoId } = req.params
    await Photo.delete(photoId)
    res.json({ success: true, message: 'Xóa ảnh thành công' })
  } catch (error) {
    next(error)
  }
}
