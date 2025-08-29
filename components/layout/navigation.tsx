"use client"

import { Package, Brain, Home, Bell, User } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function Navigation() {
  const router = useRouter()
  const pathname = usePathname()

  const navigationItems = [
    {
      name: "Products",
      href: "/",
      icon: Home,
      description: "Upload and manage menu products",
    },
    {
      name: "LLM Demo",
      href: "/llm-demo",
      icon: Brain,
      description: "Test AI menu processing",
    },
  ]

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname === href
  }

  return (
    <>
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white px-6 py-5 shadow-xl border-b border-emerald-400/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg">
                <Package className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight text-white">Applova</div>
                <div className="text-sm text-emerald-100/90 font-medium">Menu Intelligence Platform</div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            <button className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer group shadow-lg">
              <Bell className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
            </button>

            {/* User Profile */}
            <button className="flex items-center space-x-3 bg-white/10 rounded-xl px-4 py-2.5 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer group shadow-lg">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-sm font-medium text-white">
                <div className="text-left">CHARIN@GETAPPLOVA.COM</div>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className={cn(
                    "group relative flex items-center space-x-4 px-6 py-4 rounded-t-2xl transition-all duration-300 ease-out",
                    "hover:bg-gradient-to-b hover:from-emerald-50 hover:to-transparent hover:shadow-md",
                    active
                      ? "bg-gradient-to-b from-emerald-50 to-white text-emerald-700 border-b-3 border-emerald-500 shadow-md"
                      : "text-gray-600 hover:text-emerald-700",
                  )}
                >
                  {/* Active indicator background */}
                  {active && (
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/80 to-transparent rounded-t-2xl" />
                  )}

                  {/* Icon */}
                  <div
                    className={cn(
                      "relative z-10 p-2.5 rounded-xl transition-all duration-300 shadow-sm",
                      active
                        ? "bg-emerald-100 text-emerald-600 shadow-emerald-200/50"
                        : "bg-gray-100 text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 group-hover:shadow-emerald-200/30",
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Text */}
                  <div className="relative z-10">
                    <div
                      className={cn(
                        "font-semibold transition-colors duration-300 text-base",
                        active ? "text-emerald-700" : "text-gray-700 group-hover:text-emerald-700",
                      )}
                    >
                      {item.name}
                    </div>
                    <div
                      className={cn(
                        "text-xs transition-colors duration-300 font-medium",
                        active ? "text-emerald-600" : "text-gray-500 group-hover:text-emerald-600",
                      )}
                    >
                      {item.description}
                    </div>
                  </div>

                  {/* Hover effect overlay */}
                  <div
                    className={cn(
                      "absolute inset-0 rounded-t-2xl transition-all duration-300 opacity-0",
                      "group-hover:opacity-100 group-hover:bg-gradient-to-b group-hover:from-emerald-50/60 group-hover:to-transparent",
                      !active && "group-hover:shadow-lg",
                    )}
                  />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
