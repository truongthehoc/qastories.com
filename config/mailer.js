import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

export const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export const sendNotificationEmail = async ({ name, phone, email, date, service, note }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('ℹ️ [Mailer] Bỏ qua gửi email (chưa cấu hình SMTP_USER/SMTP_PASS trong .env)')
    return false
  }

  const transporter = createTransporter()
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #fed7aa; border-radius: 12px; overflow: hidden;">
      <div style="background: #FF7A2F; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">QA Stories</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0; font-size: 14px;">Thông báo yêu cầu đặt lịch mới</p>
      </div>
      <div style="padding: 24px; background: #ffffff;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; color: #4b5563; width: 35%;">Họ và tên:</td><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 600;">${name}</td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; color: #4b5563;">Số điện thoại:</td><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 600;"><a href="tel:${phone}" style="color: #FF7A2F; text-decoration: none;">${phone}</a></td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; color: #4b5563;">Email:</td><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #111827;">${email || 'Không cung cấp'}</td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; color: #4b5563;">Ngày chụp dự kiến:</td><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #111827;">${date || 'Chưa xác định'}</td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: bold; color: #4b5563;">Gói dịch vụ:</td><td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #FF7A2F; font-weight: bold;">${service}</td></tr>
          <tr><td style="padding: 10px 0; font-weight: bold; color: #4b5563; vertical-align: top;">Ghi chú thêm:</td><td style="padding: 10px 0; color: #374151; white-space: pre-wrap;">${note || 'Không có'}</td></tr>
        </table>
      </div>
      <div style="background: #FFF8F4; padding: 14px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #fed7aa;">
        Email được gửi tự động từ hệ thống website QA Stories Portfolio
      </div>
    </div>
  `

  await transporter.sendMail({
    from: `"QA Stories Studio" <${process.env.SMTP_USER}>`,
    to: process.env.NOTIFY_EMAIL || process.env.SMTP_USER,
    subject: `[QA Stories] Đặt lịch mới: ${name} - ${service}`,
    html: emailHtml,
  })

  return true
}
