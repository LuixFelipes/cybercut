import React from 'react'

interface StatCardProps {
  label: string
  value: string | number
  desc: string
  icon?: string
  color?: 'cyan' | 'pink' | 'green' | 'amber' | 'purple'
  className?: string
}

const colorMap = {
  cyan: 'from-cyber-cyan',
  pink: 'from-cyber-pink',
  green: 'from-cyber-green',
  amber: 'from-cyber-amber',
  purple: 'from-cyber-purple',
}

const textColorMap = {
  cyan: 'text-cyber-cyan',
  pink: 'text-cyber-pink',
  green: 'text-cyber-green',
  amber: 'text-cyber-amber',
  purple: 'text-cyber-purple',
}

export default function StatCard({ label, value, desc, icon, color = 'cyan', className = '' }: StatCardProps) {
  return (
    <div className={`glass rounded-[14px] p-5 relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ${className}`}>
      {/* Top color bar */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${colorMap[color]} to-transparent`} />

      <div className="font-[family-name:var(--font-jetbrains)] text-[9px] tracking-[2px] uppercase text-tx-3 mb-3">
        {label}
      </div>
      <div className={`font-[family-name:Orbitron] text-3xl font-black ${textColorMap[color]} mb-1`}>
        {value}
      </div>
      <div className="text-tx-3 text-[12px]">{desc}</div>

      {icon && (
        <div className="absolute top-4 right-4 text-2xl opacity-30 group-hover:opacity-60 group-hover:scale-110 transition-all duration-300">
          {icon}
        </div>
      )}
    </div>
  )
}
