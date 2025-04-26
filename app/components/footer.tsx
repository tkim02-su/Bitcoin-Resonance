'use client';

import { FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="w-full text-center py-6 border-t border-gray-700 mt-20 z-10">
      <div className="flex flex-col items-center space-y-4">
        <p className="text-sm text-gray-400">
          Built with ❤️ in the Universe
        </p>
        <div className="flex items-center space-x-2">
          <a
            href="https://www.linkedin.com/in/tae-uk-kim/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-400 hover:text-blue-300 transition"
          >
            <FaLinkedin size={20} className="mr-1" />
            <span className="text-sm hover:underline">Connect on LinkedIn</span>
          </a>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          © 2025 Bitcoin Resonance. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
