// icon:donut | Lucide https://lucide.dev/ | Lucide
import * as React from 'react';

/**
 * Renders a donut icon
 *
 * @returns The JSX element representing the donut icon
 */
function DonutIcon() {
  return (
    <svg
      fill='pink'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={2}
      viewBox='0 0 24 24'
      height='3em'
      width='3em'
      xmlns='http://www.w3.org/2000/svg'>
      <path d='M20.5 10a2.5 2.5 0 01-2.4-3H18a2.95 2.95 0 01-2.6-4.4 10 10 0 106.3 7.1c-.3.2-.8.3-1.2.3' />
      <path d='M15 12 A3 3 0 0 1 12 15 A3 3 0 0 1 9 12 A3 3 0 0 1 15 12 z' />
    </svg>
  );
}

export default DonutIcon;
