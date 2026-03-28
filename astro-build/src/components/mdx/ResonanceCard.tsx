/**
 * ResonanceCard — Link card for Resonance documents
 *
 * Drop into any MDX post to link to the full reasoning surface:
 *
 *   <ResonanceCard
 *     url="https://document-resonance.vercel.app/doc/agentic-commerce"
 *     title="Agentic Commerce — Strategic Vision"
 *     description="Full strategy document with source tiers, reasoning annotations, and an agent you can interrogate."
 *     sections={21}
 *     annotations={9}
 *   />
 */

interface ResonanceCardProps {
  url: string;
  title: string;
  description?: string;
  sections?: number;
  annotations?: number;
  claims?: number;
  agentReady?: boolean;
}

export function ResonanceCard({
  url,
  title,
  description,
  sections,
  annotations,
  claims,
  agentReady = true,
}: ResonanceCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block my-8 rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-6 no-underline transition-all hover:border-athletic-brand-violet/40 hover:bg-zinc-800"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Label */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-[0.625rem] uppercase tracking-[0.1em] text-athletic-brand-violet">
              Resonance
            </span>
            {agentReady && (
              <span className="font-mono text-[0.625rem] uppercase tracking-[0.1em] text-athletic-court-orange">
                Agent-ready
              </span>
            )}
          </div>

          {/* Title */}
          <h4 className="text-lg font-semibold text-zinc-100 group-hover:text-athletic-brand-violet transition-colors m-0">
            {title}
          </h4>

          {/* Description */}
          {description && (
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed m-0">
              {description}
            </p>
          )}

          {/* Stats */}
          <div className="flex flex-wrap gap-3 mt-3 font-mono text-[0.6875rem] text-zinc-500">
            {sections !== undefined && (
              <span>{sections} sections</span>
            )}
            {annotations !== undefined && annotations > 0 && (
              <span>{annotations} annotations</span>
            )}
            {claims !== undefined && claims > 0 && (
              <span>{claims} claims</span>
            )}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0 mt-1 text-zinc-600 group-hover:text-athletic-brand-violet transition-colors">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.833 14.167L14.167 5.833M14.167 5.833H5.833M14.167 5.833V14.167" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-4 pt-4 border-t border-zinc-700/50">
        <span className="text-sm text-zinc-500 group-hover:text-athletic-brand-violet transition-colors">
          Explore the reasoning →
        </span>
      </div>
    </a>
  );
}

export default ResonanceCard;
