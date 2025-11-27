import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Initialize Mermaid with Signal Dispatch theme
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    // Background colors
    primaryColor: '#8b5cf6', // violet
    secondaryColor: '#f97316', // orange
    tertiaryColor: '#18181b', // zinc-900

    // Text colors
    primaryTextColor: '#e4e4e7', // zinc-200
    secondaryTextColor: '#a1a1aa', // zinc-400

    // Line/border colors
    lineColor: '#71717a', // zinc-500

    // Node colors
    mainBkg: '#27272a', // zinc-800
    nodeBorder: '#8b5cf6', // violet
    clusterBkg: '#18181b', // zinc-900
    clusterBorder: '#3f3f46', // zinc-700

    // Note colors
    noteBkgColor: '#f97316', // orange
    noteTextColor: '#18181b', // zinc-900
    noteBorderColor: '#ea580c', // orange-600

    // Flowchart specific
    edgeLabelBackground: '#27272a',

    // Sequence diagram
    actorBkg: '#27272a',
    actorBorder: '#8b5cf6',
    actorTextColor: '#e4e4e7',
    actorLineColor: '#71717a',
    signalColor: '#8b5cf6',
    signalTextColor: '#e4e4e7',
    labelBoxBkgColor: '#27272a',
    labelBoxBorderColor: '#8b5cf6',
    labelTextColor: '#e4e4e7',
    loopTextColor: '#a1a1aa',

    // Font
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '14px',
  },
  flowchart: {
    curve: 'basis',
    padding: 20,
    nodeSpacing: 50,
    rankSpacing: 50,
  },
  sequence: {
    diagramMarginX: 50,
    diagramMarginY: 10,
    actorMargin: 50,
    boxMargin: 10,
    boxTextMargin: 5,
    noteMargin: 10,
    messageMargin: 35,
    mirrorActors: true,
    bottomMarginAdj: 1,
    useMaxWidth: true,
    rightAngles: false,
    showSequenceNumbers: false,
  },
});

interface MermaidProps {
  chart: string;
  caption?: string;
}

export default function Mermaid({ chart, caption }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderChart = async () => {
      if (!containerRef.current) return;

      try {
        // Generate unique ID for this chart
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

        // Render the chart
        const { svg: renderedSvg } = await mermaid.render(id, chart);
        setSvg(renderedSvg);
        setError(null);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
      }
    };

    renderChart();
  }, [chart]);

  if (error) {
    return (
      <div className="my-8 p-4 rounded-lg border border-red-500/30 bg-red-500/10">
        <p className="text-red-400 text-sm font-mono">Diagram Error: {error}</p>
        <pre className="mt-2 text-xs text-zinc-500 overflow-x-auto">{chart}</pre>
      </div>
    );
  }

  return (
    <figure className="my-8">
      <div
        ref={containerRef}
        className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {caption && (
        <figcaption className="mt-2 text-sm text-zinc-500 text-center italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
