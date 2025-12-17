import { Link } from "react-router-dom"
import { Facebook, Twitter, Instagram, Youtube, Music2, Mail, MapPin } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-gradient-to-b from-slate-900/50 to-slate-950/80 border-t border-slate-800/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Music2 className="w-8 h-8 text-orange-500" />
              <h3 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                HungYenSound
              </h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Nền tảng nghe nhạc trực tuyến hàng đầu. Stream nhạc yêu thích mọi lúc, mọi nơi.
            </p>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <MapPin className="w-4 h-4" />
              <span>Hưng Yên, Việt Nam</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-slate-200">Khám Phá</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-slate-400 hover:text-orange-400 transition-colors text-sm flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Trang Chủ</span>
                </Link>
              </li>
              <li>
                <Link to="/genres" className="text-slate-400 hover:text-orange-400 transition-colors text-sm flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Thể Loại</span>
                </Link>
              </li>
              <li>
                <Link to="/playlists" className="text-slate-400 hover:text-orange-400 transition-colors text-sm flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Playlists</span>
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-slate-400 hover:text-orange-400 transition-colors text-sm flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Tìm Kiếm</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-slate-200">Tài Khoản</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/profile" className="text-slate-400 hover:text-orange-400 transition-colors text-sm flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Hồ Sơ</span>
                </Link>
              </li>
              <li>
                <Link to="/my-playlists" className="text-slate-400 hover:text-orange-400 transition-colors text-sm flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Playlist Của Tôi</span>
                </Link>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-orange-400 transition-colors text-sm flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Cài Đặt</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-orange-400 transition-colors text-sm flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Trợ Giúp</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Social & Contact */}
          <div>
            <h3 className="text-base font-semibold mb-4 text-slate-200">Kết Nối</h3>
            <div className="flex gap-3 mb-6">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-800/50 hover:bg-orange-600 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 group"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-800/50 hover:bg-orange-600 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 group"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-800/50 hover:bg-orange-600 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 group"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-800/50 hover:bg-orange-600 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 group"
                aria-label="Youtube"
              >
                <Youtube className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
            </div>
            <a href="mailto:contact@hungyensound.vn" className="flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors text-sm">
              <Mail className="w-4 h-4" />
              <span>contact@hungyensound.vn</span>
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800/50"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8">
          <p className="text-slate-500 text-sm">
            &copy; {currentYear} HungYenSound. Bản quyền thuộc về chúng tôi.
          </p>
          <div className="flex flex-wrap gap-6 text-sm">
            <a href="#" className="text-slate-500 hover:text-orange-400 transition-colors">
              Điều Khoản Sử Dụng
            </a>
            <a href="#" className="text-slate-500 hover:text-orange-400 transition-colors">
              Chính Sách Bảo Mật
            </a>
            <a href="#" className="text-slate-500 hover:text-orange-400 transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>

      {/* Decorative gradient */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent"></div>
    </footer>
  )
}
