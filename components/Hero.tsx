'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Sparkles, Users, Rocket, Target } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-sky-50 via-blue-50 to-indigo-50 w-full min-w-full">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-40 w-full">
        <div className="absolute top-0 right-0  h-96 bg-blue-200 w-full rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0  h-96 bg-indigo-200 w-full rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="ml-10 relative w-full min-w-full px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Innovation in STEM Education</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Welcome to{' '}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-blue-600">
                  Robonauts Club
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Where innovation meets curiosity. Join us in exploring the exciting world of robotics, 
                automation, and STEM education through hands-on workshops and competitions.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/events"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Explore Events
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold border-2 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
              >
                Learn More
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span className="text-2xl font-bold text-gray-900">500+</span>
                </div>
                <p className="text-sm text-gray-600">Active Members</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <Rocket className="w-5 h-5 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900">50+</span>
                </div>
                <p className="text-sm text-gray-600">Events Hosted</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <Target className="w-5 h-5 text-purple-600" />
                  <span className="text-2xl font-bold text-gray-900">100+</span>
                </div>
                <p className="text-sm text-gray-600">Projects Completed</p>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Main image container with gradient border */}
              <div className="absolute inset-0 bg-linear-to-br from-indigo-400 to-blue-500 rounded-3xl transform rotate-6 opacity-20 blur-xl" />
              <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100">
                <div className="aspect-square relative rounded-3xl overflow-hidden bg-linear-to-br from-sky-100 to-indigo-100">
                  <Image
                    src="/robot.gif"
                    alt="Robonauts Club Logo"
                    fill
                    className="object-contain rounded-3xl"
                    priority
                  />
                </div>
                
                {/* Floating cards */}
                <div className="absolute -top-4 -right-4 bg-white rounded-xl p-4 shadow-lg border border-gray-200 animate-pulse">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-sm font-semibold text-gray-700">Active Now</span>
                  </div>
                </div>
                
                <div className="absolute -bottom-4 -left-4 bg-indigo-600 text-white rounded-xl p-4 shadow-lg">
                  <div className="text-2xl font-bold">2024</div>
                  <div className="text-sm opacity-90">Robotics Year</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-white to-transparent" />
    </section>
  )
}
