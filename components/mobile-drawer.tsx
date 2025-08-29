"use client"

import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MobileDrawer() {
  const [isOpen, setIsOpen] = useState(false)

  // Lock body scroll when drawer is open (prevents any stray scrollbars)
  useEffect(() => {
    const original = document.body.style.overflow
    if (isOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = original || ""
    return () => {
      document.body.style.overflow = original || ""
    }
  }, [isOpen])

  return (
    <>
      {/* Hamburger button (always visible) */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls="site-drawer"
      >
        <Menu className="w-5 h-5" />
        <span className="sr-only">Open menu</span>
      </Button>

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setIsOpen(false)} aria-hidden="true" />}

      {/* Drawer (right side). When closed, push >100% so it never peeks. */}
      <div
        id="site-drawer"
        role="dialog"
        aria-modal="true"
        className={`fixed top-0 right-0 z-50 h-full w-80 sm:w-96 max-w-[100vw] bg-white shadow-xl transform transition-transform duration-300 will-change-transform
          ${isOpen ? "translate-x-0 pointer-events-auto" : "translate-x-[105%] pointer-events-none"}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="text-pink-600 text-xl font-semibold tracking-tight">RecoupYou</span>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} aria-label="Close menu">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="p-4 overflow-y-auto h-[calc(100%-57px)]">
          <ul className="space-y-2">
            <li>
              <a href="#" className="block rounded-lg px-3 py-2 hover:bg-zinc-50 text-sm text-zinc-800">
                Membership
              </a>
            </li>
            <li>
              <a href="#" className="block rounded-lg px-3 py-2 hover:bg-zinc-50 text-sm text-zinc-800">
                Fitness Guides
              </a>
            </li>
            <li>
              <a href="#" className="block rounded-lg px-3 py-2 hover:bg-zinc-50 text-sm text-zinc-800">
                In‐Person Training
              </a>
            </li>
            <li>
              <a href="#" className="block rounded-lg px-3 py-2 hover:bg-zinc-50 text-sm text-zinc-800">
                1‐on‐1 Coaching
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </>
  )
}
