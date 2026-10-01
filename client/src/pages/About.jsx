import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Camera, Heart, Quote, MapPin } from 'lucide-react'
import { ScrollReveal } from '../components/ui/ScrollReveal'
import { useSettings } from '../context/SettingsContext'

export default function About() {
  const { settings, refreshSettings } = useSettings()

  useEffect(() => {
    refreshSettings?.()
  }, [])

  const founderName = settings.about_founder_name !== undefined ? settings.about_founder_name : 'Min'
  const founderRole = settings.about_founder_role !== undefined ? settings.about_founder_role : ''
  const founderImage = settings.about_image || 'https://images.unsplash.com/photo-1554080353-a576cf803bda?w=800&q=80'
  const founderAvatar = settings.about_founder_avatar || founderImage
  const siteName = settings.brand_name || settings.site_name || 'QA Stories'
  const studioAddress = settings.brand_address || settings.address || 'Bình Dương'
  const headerLabel = settings.about_header_label || 'Lời Ngỏ Từ Trái Tim'
  const storyTitle = settings.about_story_title || 'Nhiếp ảnh là cách mình lưu giữ linh hồn của khoảnh khắc.'
  const storyP1 = settings.about_story_p1 || `Chào bạn, mình là ${founderName} — một người say mê nhiếp ảnh và cái đẹp từ những điều dung dị nhất. Mình chuyên về ảnh em bé, chân dung ngoài trời (ngoại cảnh) tại ${studioAddress}.`
  const storyP2 = settings.about_story_p2 || 'Đối với mình, mỗi buổi chụp không đơn thuần là một buổi làm việc, mà là cuộc gặp gỡ, trò chuyện và cùng tạo nên những kỷ niệm đẹp qua từng bức ảnh.'
  const quoteText = settings.about_quote_text || 'Mỗi em bé là một thiên thần nhỏ, mỗi nụ cười là một câu chuyện vô giá được lưu giữ trọn vẹn qua thời gian.'
  const quoteAuthor = settings.about_quote_author || siteName
  const quoteColor = settings.about_quote_color || '#1f2937'
  const quoteAuthorColor = settings.about_quote_author_color || '#E06738'

  const isContactEnabled =
    settings?.page_contact_enabled !== '0' &&
    settings?.page_contact_enabled !== false &&
    settings?.page_contact_enabled !== 0

  return (
    <div className="pt-20 bg-[#FFFDF9] min-h-screen overflow-hidden font-body">
      {/* Ambient Soft Glows */}
      <div className="fixed top-20 left-0 w-96 h-96 rounded-full bg-orange-100/40 blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-0 w-[450px] h-[450px] rounded-full bg-amber-100/30 blur-3xl pointer-events-none -z-10" />

      {/* 1. Hero / Artistic Story Section */}
      <section className="py-14 sm:py-20 lg:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left: Editorial Storytelling */}
            <div className="lg:col-span-7 space-y-6">
              <ScrollReveal direction="left">
                {/* Delicate Label (No AI icons) */}
                <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-orange-100/70 border border-orange-200/60 text-primary text-xs font-bold tracking-wider uppercase mb-2 shadow-2xs">
                  <span>{headerLabel}</span>
                </div>

                {/* Main Headline */}
                <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight leading-[1.25] mb-6 whitespace-pre-line">
                  {storyTitle}
                </h1>

                {/* Paragraphs with soft styling */}
                <div className="space-y-4 text-gray-600 font-body text-base sm:text-lg leading-relaxed">
                  <p className="whitespace-pre-line">
                    {storyP1}
                  </p>
                  {storyP2 && (
                    <p className="border-l-2 border-primary/40 pl-4 italic text-gray-700 font-body text-base sm:text-lg whitespace-pre-line">
                      {storyP2}
                    </p>
                  )}
                </div>

                {/* Artistic Founder Signature Card */}
                <div className="mt-8 p-4 sm:p-5 rounded-3xl bg-white/80 backdrop-blur-md border border-orange-200/70 shadow-lg shadow-orange-950/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full overflow-hidden ring-3 ring-primary/30 ring-offset-2 bg-orange-100 shadow-sm shrink-0">
                        <img
                          src={founderAvatar}
                          alt={founderName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow-xs">
                        <Camera size={11} />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-heading font-bold text-gray-900 text-lg leading-snug">
                        {founderName}
                      </h4>
                      <p className="font-body text-xs text-primary font-semibold tracking-wide">
                        {founderRole}
                      </p>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 font-medium italic border-t sm:border-t-0 sm:border-l border-orange-100 pt-2 sm:pt-0 sm:pl-4">
                    <Quote size={13} className="text-primary-light shrink-0" />
                    <span>Từng bức ảnh là một tình yêu</span>
                  </div>
                </div>

                {/* Action CTAs */}
                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <Link
                    to="/album"
                    className="btn-primary py-3 px-7 text-sm sm:text-base shadow-xl shadow-primary/25 inline-flex items-center gap-2"
                  >
                    Xem Bộ Sưu Tập <ArrowRight size={17} />
                  </Link>
                  {isContactEnabled && (
                    <Link
                      to="/contact"
                      className="btn-outline py-3 px-6 text-sm sm:text-base bg-white/90 shadow-sm"
                    >
                      Liên Hệ Đặt Lịch
                    </Link>
                  )}
                </div>
              </ScrollReveal>
            </div>

            {/* Right: Layered Organic Art Photo Frame */}
            <div className="lg:col-span-5">
              <ScrollReveal direction="right" delay={0.15}>
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Decorative Rotated Back Layer */}
                  <div className="absolute -inset-3 bg-gradient-to-tr from-orange-200/40 via-amber-100/30 to-rose-100/30 rounded-[36px] -rotate-2 -z-10 shadow-sm" />
                  
                  {/* Main Portrait Frame */}
                  <div className="rounded-[32px] overflow-hidden shadow-2xl shadow-orange-950/10 border-4 border-white aspect-[4/5] bg-orange-100/40 relative group">
                    <img
                      src={founderImage}
                      alt={`${founderName} - ${siteName}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                    {/* Top Floating Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="bg-black/40 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1.5 rounded-full border border-white/20 shadow-sm flex items-center gap-1.5">
                        <Heart size={12} className="text-primary-light fill-primary-light" />
                        {siteName}
                      </span>
                    </div>

                    {/* Bottom Floating Info Badge */}
                    <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md py-2.5 px-4 rounded-2xl border border-orange-100/80 shadow-lg flex items-center">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-orange-100 text-primary flex items-center justify-center shrink-0">
                          <Camera size={16} />
                        </div>
                        <div className="text-left">
                          <div className="font-heading font-bold text-gray-900 text-xs">{siteName}</div>
                          <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                            <MapPin size={11} className="text-primary" /> {studioAddress}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Heartfelt Manifesto Quote Divider */}
      <section className="py-12 bg-gradient-to-r from-orange-50/70 via-white to-orange-50/70 border-y border-orange-100/70">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ScrollReveal>
            <div className="w-10 h-10 rounded-full bg-orange-100 text-primary flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Quote size={18} />
            </div>
            <p
              className="font-heading italic text-lg sm:text-xl md:text-2xl leading-relaxed max-w-2xl mx-auto font-normal whitespace-pre-line"
              style={{ color: quoteColor }}
            >
              &ldquo;{quoteText}&rdquo;
            </p>
            <span
              className="font-body text-xs font-bold uppercase tracking-widest mt-3 block"
              style={{ color: quoteAuthorColor }}
            >
              — {quoteAuthor}
            </span>
          </ScrollReveal>
        </div>
      </section>

      {/* 3. Soft Luxurious Bottom CTA Card */}
      <section className="py-16 sm:py-20 bg-[#FFFDF9]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="bg-gradient-to-br from-[#E06738] via-[#C95326] to-[#A33D17] rounded-[36px] p-8 sm:p-14 text-center text-white relative overflow-hidden shadow-2xl shadow-orange-950/20">
              {/* Background ambient radial circles */}
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-black/10 blur-2xl pointer-events-none" />

              <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white/90 text-xs font-semibold uppercase tracking-wider">
                  Cùng Kể Câu Chuyện Của Bạn
                </span>

                <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-snug">
                  Bạn đã sẵn sàng ghi lại những khoảnh khắc đầu đời của con?
                </h2>

                <p className="font-body text-white/85 text-sm sm:text-base leading-relaxed max-w-lg mx-auto pb-2">
                  Hãy để <strong className="text-white font-semibold">{siteName}</strong> đồng hành cùng gia đình bạn lưu giữ những kỷ niệm quý giá nhất.
                </p>

                <div className="pt-2">
                  {isContactEnabled ? (
                    <Link
                      to="/contact"
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-primary font-bold text-sm sm:text-base shadow-xl hover:bg-orange-50 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                    >
                      Liên Hệ Đặt Lịch Chụp Ngay <ArrowRight size={17} />
                    </Link>
                  ) : (
                    <Link
                      to="/album"
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-primary font-bold text-sm sm:text-base shadow-xl hover:bg-orange-50 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                    >
                      Khám Phá Bộ Sưu Tập <ArrowRight size={17} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}