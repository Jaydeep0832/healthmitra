import React from 'react';
import { AlertTriangle, Info, Activity } from 'lucide-react';

interface FormattedMessageProps {
  content: string;
  isEscalated?: boolean;
}

interface StepItem {
  number: string;
  title: string;
  body: string;
}

export default function FormattedMessage({ content, isEscalated }: FormattedMessageProps) {
  if (!content) return null;

  if (content === '...') {
    return (
      <div className="flex items-center space-x-2 py-1 px-1">
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></div>
        </div>
        <span className="text-xs text-slate-500 font-medium ml-1.5">HealthMitra AI is preparing clinical advice...</span>
      </div>
    );
  }


  // Render inline formatting (**bold**, *italic*)
  const renderInlineFormatted = (text: string) => {
    // Split by bold (**text**)
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-extrabold text-slate-900 bg-emerald-50/70 px-1 py-0.5 rounded text-inherit">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  // Pre-process: If numbered points are stuck together without newlines (e.g. "... કરો: 1. ... 2. ..."),
  // split them into newlines so they can be parsed as steps.
  let normalized = content
    .replace(/\r\n/g, '\n')
    .replace(/(?:\s|^)([0-9]{1,2}|[૧-૯])[.)]\s+/g, '\n$1. ');

  const rawLines = normalized.split('\n').map(l => l.trim()).filter(Boolean);

  const introParagraphs: string[] = [];
  const steps: StepItem[] = [];
  const conclusionLines: string[] = [];
  let hasParsedSteps = false;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    // Check if line matches a numbered point or bullet (e.g. "1. ", "૧. ", "• ", "- ")
    const stepMatch = line.match(/^([0-9]{1,2}|[૧-૯]|•|-|\*)\.?\s+(.*)/);

    if (stepMatch) {
      hasParsedSteps = true;
      const num = stepMatch[1];
      const remainder = stepMatch[2];

      // Check if remainder has "Title: Body" or "**Title**: Body"
      let title = '';
      let body = remainder;

      const boldTitleMatch = remainder.match(/^\*\*([^*]+)\*\*[:\s-]?\s*(.*)/);
      if (boldTitleMatch) {
        title = boldTitleMatch[1];
        body = boldTitleMatch[2];
      } else {
        const colonIdx = remainder.indexOf(':');
        if (colonIdx > 0 && colonIdx < 40) {
          title = remainder.substring(0, colonIdx).replace(/\*\*/g, '').trim();
          body = remainder.substring(colonIdx + 1).trim();
        }
      }

      steps.push({
        number: num,
        title,
        body
      });
    } else if (hasParsedSteps) {
      // Lines after steps are treated as conclusions/doctor notes
      conclusionLines.push(line);
    } else {
      introParagraphs.push(line);
    }
  }

  return (
    <div className="space-y-3.5 text-sm leading-relaxed text-slate-800">
      {/* Intro Header / Paragraphs */}
      {introParagraphs.length > 0 && (
        <div className="space-y-2">
          {introParagraphs.map((para, idx) => (
            <p key={idx} className="text-slate-800 font-medium">
              {renderInlineFormatted(para)}
            </p>
          ))}
        </div>
      )}

      {/* Step / Point Flow Container */}
      {steps.length > 0 && (
        <div className="mt-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2.5">
            <Activity className="h-3.5 w-3.5 text-emerald-600" />
            <span>માર્ગદર્શન અને ઉપાયો (Recommended Flow & Steps)</span>
          </div>

          <div className="space-y-2.5 relative before:absolute before:top-3 before:bottom-3 before:left-3.5 before:w-0.5 before:bg-emerald-200/60">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="relative flex items-start gap-3 p-3 bg-white hover:bg-emerald-50/30 rounded-xl border border-slate-200/80 shadow-2xs transition-all duration-150"
              >
                {/* Step Number Badge */}
                <div className="relative z-10 w-7 h-7 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/20">
                  {step.number.replace(/[•\-*]/, '✓')}
                </div>

                {/* Step Body */}
                <div className="flex-1 min-w-0">
                  {step.title && (
                    <div className="font-bold text-emerald-950 text-xs sm:text-sm mb-0.5 flex items-center gap-1.5">
                      <span>{step.title}</span>
                    </div>
                  )}
                  <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                    {renderInlineFormatted(step.body)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conclusion / Cautionary Callout */}
      {conclusionLines.length > 0 && (
        <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200/90 rounded-xl text-amber-950 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
          <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            {conclusionLines.map((line, idx) => (
              <p key={idx} className="leading-relaxed">
                {renderInlineFormatted(line)}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Alert Badge */}
      {isEscalated && (
        <div className="mt-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm flex items-start gap-2.5 animate-pulse">
          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-extrabold text-red-700">તાત્કાલિક તબીબી સારવારની ભલામણ (Immediate Medical Attention)</p>
            <p className="text-red-800 mt-0.5 text-xs">
              કૃપા કરીને વિલંબ કર્યા વિના ૧૦૮ એમ્બ્યુલન્સ અથવા નજીકની હોસ્પિટલનો સંપર્ક કરો.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
