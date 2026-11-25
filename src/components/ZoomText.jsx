import { Fragment } from 'react';

const STAGGER = 0.04;

export default function ZoomText({ text, highlight, highlightClassName = '' }) {
  const words = text.split(' ');
  let charIndex = 0;

  return (
    <span aria-hidden="true">
      {words.map((word, wordIndex) => {
        const characters = word.split('').map((character) => {
          const delay = charIndex * STAGGER;
          const key = `${wordIndex}-${charIndex}`;
          charIndex += 1;

          return (
            <span
              key={key}
              className={`zoom-out-char ${word === highlight ? highlightClassName : ''}`}
              style={{ animationDelay: `${delay}s` }}
            >
              {character}
            </span>
          );
        });

        const trailingSpace = wordIndex < words.length - 1 ? ' ' : null;
        if (trailingSpace) charIndex += 1;

        return (
          <Fragment key={wordIndex}>
            <span className="inline-block whitespace-nowrap">{characters}</span>
            {trailingSpace}
          </Fragment>
        );
      })}
    </span>
  );
}
