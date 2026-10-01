import Package from '../models/Package.js'

export const getPublicPackages = async (req, res, next) => {
  try {
    const packages = await Package.getAll({ is_active: 1 })
    res.json({ success: true, data: packages })
  } catch (error) {
    next(error)
  }
}

export const getAllPackagesAdmin = async (req, res, next) => {
  try {
    const { is_active } = req.query
    const packages = await Package.getAll({ is_active })
    res.json({ success: true, data: packages })
  } catch (error) {
    next(error)
  }
}

export const getPackageById = async (req, res, next) => {
  try {
    const { id } = req.params
    const pkg = await Package.getById(id)
    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy gói dịch vụ' })
    }
    res.json({ success: true, data: pkg })
  } catch (error) {
    next(error)
  }
}

export const createPackage = async (req, res, next) => {
  try {
    const { name, slug, price, description, is_active, sort_order } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Tên gói dịch vụ là bắt buộc' })
    }

    const newPackage = await Package.create({
      name: name.trim(),
      slug,
      price: price ? Number(price) : 0,
      description: description ? description.trim() : '',
      is_active: is_active !== undefined ? (is_active ? 1 : 0) : 1,
      sort_order: sort_order ? Number(sort_order) : 0,
    })

    res.status(201).json({ success: true, message: 'Tạo gói dịch vụ thành công', data: newPackage })
  } catch (error) {
    next(error)
  }
}

export const updatePackage = async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, slug, price, description, is_active, sort_order } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Tên gói dịch vụ là bắt buộc' })
    }

    const success = await Package.update(id, {
      name: name.trim(),
      slug,
      price: price ? Number(price) : 0,
      description: description ? description.trim() : '',
      is_active: is_active ? 1 : 0,
      sort_order: sort_order ? Number(sort_order) : 0,
    })

    if (!success) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy gói dịch vụ để cập nhật' })
    }

    res.json({ success: true, message: 'Cập nhật gói dịch vụ thành công' })
  } catch (error) {
    next(error)
  }
}

export const deletePackage = async (req, res, next) => {
  try {
    const { id } = req.params
    const success = await Package.delete(id)
    if (!success) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy gói dịch vụ để xóa' })
    }
    res.json({ success: true, message: 'Đã xóa gói dịch vụ thành công' })
  } catch (error) {
    next(error)
  }
}
