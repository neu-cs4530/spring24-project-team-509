// icon:pizza | Lucide https://lucide.dev/ | Lucide
import * as React from 'react';

/**
 * Renders a pizza icon
 *
 * @returns The pizza icon SVG element
 */
function PizzaIcon() {
  return (
    <svg
      fill='orange'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      viewBox='0 0 24 24'
      height='3em'
      width='3em'
      xmlns='http://www.w3.org/2000/svg'>
      <path d='M15 11h.01M11 15h.01M16 16h.01M2 16l20 6-6-20A20 20 0 002 16M5.71 17.11a17.04 17.04 0 0111.4-11.4' />
    </svg>
  );
}

export default PizzaIcon;
