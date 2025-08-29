"use client"

import { Package, Brain, Home } from "lucide-react"
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
      description: "Upload and manage menu products"
    },
    {
      name: "LLM Demo",
      href: "/llm-demo",
      icon: Brain,
      description: "Test AI menu processing"
    }
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
      <header className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xl font-bold tracking-tight">Applova</div>
                <div className="text-xs text-green-100 opacity-80">Menu Scraper</div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm hover:bg-white/30 transition-all duration-200 cursor-pointer group">
              <span className="text-lg group-hover:scale-110 transition-transform duration-200">🔔</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/20 rounded-xl px-4 py-2 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 cursor-pointer group">
              <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">C</span>
              </div>
              <div className="text-sm font-medium">
                <div>CHARIN@GETAPPLOVA.COM</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className={cn(
                    "group relative flex items-center space-x-3 px-6 py-4 rounded-t-xl transition-all duration-200 ease-out",
                    "hover:bg-gray-50 hover:shadow-sm",
                    active
                      ? "bg-white text-green-600 border-b-2 border-green-500 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  )}
                >
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute inset-0 bg-gradient-to-b from-green-50 to-transparent rounded-t-xl" />
                  )}
                  
                  {/* Icon */}
                  <div className={cn(
                    "relative z-10 p-2 rounded-lg transition-all duration-200",
                    active
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-500 group-hover:bg-green-100 group-hover:text-green-600"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  {/* Text */}
                  <div className="relative z-10">
                    <div className={cn(
                      "font-medium transition-colors duration-200",
                      active ? "text-green-700" : "text-gray-700 group-hover:text-green-700"
                    )}>
                      {item.name}
                    </div>
                    <div className={cn(
                      "text-xs transition-colors duration-200",
                      active ? "text-green-500" : "text-gray-500 group-hover:text-green-500"
                    )}>
                      {item.description}
                    </div>
                  </div>
                  
                  {/* Hover effect */}
                  <div className={cn(
                    "absolute inset-0 rounded-t-xl transition-all duration-200",
                    "group-hover:bg-gradient-to-b group-hover:from-green-50/50 group-hover:to-transparent",
                    active && "bg-gradient-to-b from-green-50 to-transparent"
                  )} />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
} 