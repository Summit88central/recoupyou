"use client"
import { useState } from "react"
import { Menu, X, ShoppingCart } from "lucide-react"

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const menuItems = [
    { name: "Home", href: "/" },
    { name: "Contact", href: "/contact" },
    { name: "Programs", href: "/programs" },
    { name: "Shop", href: "/shop" },
  ]

  return (
    <>
      {/* Glass Navigation Bar for white background */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/50 backdrop-blur-lg border-b border-gray-200 shadow-md">
        <div className="flex items-center justify-between max-w-[1200px] mx-auto px-4 sm:px-6 py-3">
          {/* Hamburger Menu - Mobile */}
          <button
            onClick={toggleMenu}
            className="p-2 rounded-md hover:bg-gray-100/50 transition-all duration-200 xl:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6 text-gray-800" />
          </button>

          {/* Logo */}
          <div className="text-2xl font-bold tracking-wider text-[#fc9dca] xl:ml-0">RY</div>

          {/* Desktop Links */}
          <div className="hidden xl:flex items-center space-x-6">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-800 font-medium hover:text-pink-500 transition-colors duration-200"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Shopping Cart */}
          <button
            className="p-2 rounded-md hover:bg-gray-100/50 transition-all duration-200"
            aria-label="Shopping cart"
          >
            <ShoppingCart className="w-6 h-6 text-gray-800" />
          </button>
        </div>
      </nav>

      {/* Slide-out Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 xl:hidden transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" onClick={toggleMenu} />

        {/* Menu panel */}
        <div
          className={`absolute left-0 top-0 h-full w-64 bg-white/90 backdrop-blur-md border-r border-gray-200 shadow-xl transform transition-transform duration-300 ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Menu</h2>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md hover:bg-gray-100/50 transition-all"
              aria-label="Close menu"
            >
              <X className="w-6 h-6 text-gray-800" />
            </button>
          </div>

          <nav className="p-6">
            <ul className="space-y-4">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="block py-2 px-4 text-lg text-gray-800 rounded-md hover:bg-gray-100/50 transition-all duration-200"
                    onClick={toggleMenu}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}

export default Header
