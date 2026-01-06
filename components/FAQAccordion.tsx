'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

type FAQItem = {
  question: string
  answer: string
}

type FAQAccordionProps = {
  items: FAQItem[]
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="group border-2 border-gray-200 rounded-xl bg-white overflow-hidden hover:border-indigo-200 hover:shadow-lg transition-all duration-300"
        >
          <button
            onClick={() => toggleItem(index)}
            className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-linear-to-r hover:from-indigo-50/50 hover:to-transparent transition-all duration-300"
            aria-expanded={openIndex === index}
          >
            <span className="font-semibold text-gray-900 pr-4 group-hover:text-indigo-600 transition-colors text-left">
              {item.question}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-all duration-300 group-hover:text-indigo-500 ${
                openIndex === index ? 'rotate-180 text-indigo-500' : ''
              }`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openIndex === index
                ? 'max-h-96 opacity-100'
                : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
              {item.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

