import React, { useState, useEffect } from 'react';
import { CronBuilder } from './components/CronBuilder';

export default function App() {
  return (
    <div className="min-h-screen bg-white text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Navigation Bar */}
      <nav className="border-b-2 border-black p-4">
        <div className="flex gap-8">
          <span className="font-bold text-black">CRON COMPOSER</span>
          <a href="#about" className="underline hover:bg-black hover:text-white px-1">ABOUT</a>
          <a href="#help" className="underline hover:bg-black hover:text-white px-1">HELP</a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-8">
        <CronBuilder />
      </div>
    </div>
  );
}