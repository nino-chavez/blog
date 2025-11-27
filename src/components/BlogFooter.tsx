import { RssSimple } from '@phosphor-icons/react';

export default function BlogFooter() {
  return (
    <footer className="border-t border-zinc-800/50 mt-20">
      <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        {/* Brand - Full width on mobile, spans on desktop */}
        <div className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-zinc-800/30">
          <h3 className="text-white font-bold text-base sm:text-lg mb-2">Signal Dispatch</h3>
          <p className="text-zinc-500 text-xs sm:text-sm max-w-md">
            Architecture, commerce, and the signals that matter.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Explore */}
          <div>
            <h4 className="text-white font-semibold text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4">
              Explore
            </h4>
            <ul className="space-y-2 sm:space-y-2.5">
              <li>
                <a
                  href="/"
                  className="text-zinc-400 hover:text-athletic-brand-violet transition-colors text-xs sm:text-sm block"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/rss.xml"
                  className="text-zinc-400 hover:text-athletic-brand-violet transition-colors text-xs sm:text-sm inline-flex items-center gap-1.5 sm:gap-2"
                >
                  <RssSimple size={14} weight="bold" className="sm:w-4 sm:h-4" />
                  RSS Feed
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-white font-semibold text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4">
              Connect
            </h4>
            <ul className="space-y-2 sm:space-y-2.5">
              <li>
                <a
                  href="https://linkedin.com/in/nino-chavez"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-athletic-brand-violet transition-colors text-xs sm:text-sm block"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/nino-chavez"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-athletic-brand-violet transition-colors text-xs sm:text-sm block"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@nino.photos"
                  className="text-zinc-400 hover:text-athletic-brand-violet transition-colors text-xs sm:text-sm block"
                >
                  Email
                </a>
              </li>
            </ul>
          </div>

          {/* Work */}
          <div>
            <h4 className="text-white font-semibold text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4">
              Work
            </h4>
            <ul className="space-y-2 sm:space-y-2.5">
              <li>
                <a
                  href="https://nino.photos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-athletic-brand-violet transition-colors text-xs sm:text-sm block"
                >
                  Portfolio
                </a>
              </li>
              <li>
                <a
                  href="https://gallery.nino.photos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-athletic-brand-violet transition-colors text-xs sm:text-sm block"
                >
                  Photography
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-800/50 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 text-xs sm:text-sm text-zinc-500">
          <p className="order-2 sm:order-1">© {new Date().getFullYear()} Nino Chavez. All rights reserved.</p>
          <p className="order-1 sm:order-2 text-center sm:text-right">
            Built with{' '}
            <a
              href="https://react.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-athletic-brand-violet hover:text-athletic-court-orange transition-colors"
            >
              React
            </a>
            {' & '}
            <a
              href="https://mdxjs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-athletic-brand-violet hover:text-athletic-court-orange transition-colors"
            >
              MDX
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
