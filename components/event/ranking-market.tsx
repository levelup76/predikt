'use client'

import { useState, useEffect } from 'react'
import { GripVertical } from 'lucide-react'
import clsx from 'clsx'

type Option = { id: string, label: string }
type Market = { id: string, question: string, options_json: Option[] }

export default function RankingMarket({
  market,
  value,
  onChange,
  disabled
}: {
  market: Market,
  value?: string[],
  onChange: (newOrder: string[]) => void,
  disabled: boolean
}) {
  // If no value provided, use original order
  const [internalOrder, setInternalOrder] = useState<string[]>(
    value || market.options_json.map(o => o.id)
  )

  // Sync if value changes externally (e.g. initial load)
  useEffect(() => {
    if (value && JSON.stringify(value) !== JSON.stringify(internalOrder)) {
      setInternalOrder(value)
    }
  }, [value])

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (disabled) return
    e.dataTransfer.setData('text/plain', index.toString())
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (disabled) return
    e.preventDefault() // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    if (disabled) return
    e.preventDefault()
    const dragIndexStr = e.dataTransfer.getData('text/plain')
    const dragIndex = parseInt(dragIndexStr, 10)

    if (isNaN(dragIndex) || dragIndex === dropIndex) return

    const newOrder = [...internalOrder]
    const [movedItem] = newOrder.splice(dragIndex, 1)
    newOrder.splice(dropIndex, 0, movedItem)

    setInternalOrder(newOrder)
    onChange(newOrder)
  }
  
  // Also support touch devices generically? 
  // Native drag-and-drop handles inconsistent support on mobile. 
  // For a robust mobile specific implementation without libs, simpler might be "click to select, click to move" or up/down arrows.
  // BUT the user asked for "drag/pull". We will stick to desktop Draggable for now, 
  // maybe add Up/Down buttons as fallback/accessibility?
  
  const moveItem = (index: number, direction: 'up' | 'down') => {
      if (disabled) return
      if (direction === 'up' && index === 0) return
      if (direction === 'down' && index === internalOrder.length - 1) return
      
      const newOrder = [...internalOrder]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      
      const temp = newOrder[index]
      newOrder[index] = newOrder[targetIndex]
      newOrder[targetIndex] = temp
      
      setInternalOrder(newOrder)
      onChange(newOrder)
  }

  return (
    <div className="space-y-2">
       {internalOrder.map((optionId, index) => {
         const option = market.options_json.find(o => o.id === optionId)
         if (!option) return null
         
         return (
            <div 
              key={optionId}
              draggable={!disabled}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              className={clsx(
                "flex items-center gap-3 p-4 bg-white dark:bg-black border-2 border-black dark:border-white select-none transition-all",
                disabled ? "opacity-70 cursor-not-allowed" : "cursor-move hover:bg-yellow-100 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[2px]",
                "active:cursor-grabbing active:shadow-none active:translate-x-0 active:translate-y-0"
              )}
            >
               <span className="font-black text-black dark:text-white w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-800 border-2 border-black dark:border-white">
                  {index + 1}
               </span>
               
               <div className="flex-1 font-bold uppercase text-lg">
                  {option.label}
               </div>

               <GripVertical className="text-black dark:text-white w-6 h-6" />
               
               {/* Mobile/Accessibility controls (could be hidden on desktop optionally, but useful everywhere) */}
               {!disabled && (
                   <div className="flex flex-col gap-1 ml-2 border-l-2 border-black pl-2">
                      <button 
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveItem(index, 'up')}
                        className="p-1 hover:bg-black hover:text-white rounded-none disabled:opacity-20 text-xs font-black border border-transparent hover:border-black"
                      >
                         ▲
                      </button>
                      <button 
                        type="button"
                        disabled={index === internalOrder.length - 1}
                        onClick={() => moveItem(index, 'down')}
                        className="p-1 hover:bg-black hover:text-white rounded-none disabled:opacity-20 text-xs font-black border border-transparent hover:border-black"
                      >
                         ▼
                      </button>
                   </div>
               )}
            </div>
         )
       })}
    </div>
  )
}
