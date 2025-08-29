import {
  FaWhatsapp,
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-zinc-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Copyright */}
        <p className="text-xs text-zinc-500">
          © {currentYear} RecoupYou. All rights reserved.
        </p>

        {/* Links */}
        <nav className="flex flex-col sm:flex-row items-center gap-6 text-sm font-medium">
          {/* Refund Policy */}
          <a
            href="/refund-policy"
            className="text-zinc-600 hover:text-zinc-900 transition"
          >
            Refund Policy
          </a>

          {/* WhatsApp Button */}
          <a
            href="http://wa.me/27725817797"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition font-medium"
          >
            <FaWhatsapp className="w-5 h-5" />
            WhatsApp
          </a>

          {/* Social Icons */}
          <div className="flex gap-4">
            <a
              href="https://www.instagram.com/deefittee_?igsh=MWVyemVwZ3E3bXI5Zg%3D%3D&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-500 hover:text-pink-600 transition"
            >
              <FaInstagram className="w-6 h-6" />
            </a>
            <a
              href="https://www.facebook.com/share/16Fd564Hni/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 transition"
            >
              <FaFacebook className="w-6 h-6" />
            </a>
            <a
              href="https://www.tiktok.com/@deefittee_?_t=ZS-8zAW1Is64aP&_r=1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:text-gray-700 transition"
            >
              <FaTiktok className="w-6 h-6" />
            </a>
            <a
              href="https://youtube.com/@builtbydee?si=FVYFLpMvhZLHeWLS"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-700 transition"
            >
              <FaYoutube className="w-6 h-6" />
            </a>
          </div>
        </nav>
      </div>
    </footer>
  );
}
