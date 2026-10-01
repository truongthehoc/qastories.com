import Analytics from '../models/Analytics.js'

export const trackPageView = async (req, res, next) => {
  try {
    const { path, title, referer } = req.body
    if (!path) return res.status(400).json({ success: false, message: 'Path is required' })

    const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress || ''
    const user_agent = req.headers['user-agent'] || ''
    const isMobile = /mobile|iphone|ipad|android/i.test(user_agent)
    const device_type = isMobile ? 'mobile' : 'desktop'

    await Analytics.recordPageView({
      path,
      title: title || path,
      ip_address: typeof ip_address === 'string' ? ip_address.split(',')[0].trim() : '127.0.0.1',
      user_agent,
      device_type,
      referer: referer || req.headers.referer || '',
    })

    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

export const getAnalyticsOverview = async (req, res, next) => {
  try {
    const days = req.query.days || 14
    const overview = await Analytics.getOverview()
    const dailyTraffic = await Analytics.getDailyTraffic(days)
    const topPages = await Analytics.getTopPages(10)
    const deviceBreakdown = await Analytics.getDeviceBreakdown()
    const recentLogs = await Analytics.getRecentLogs(15)

    res.json({
      success: true,
      data: {
        overview,
        dailyTraffic,
        topPages,
        deviceBreakdown,
        recentLogs,
      },
    })
  } catch (error) {
    next(error)
  }
}
