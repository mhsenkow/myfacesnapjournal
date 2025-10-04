/**
 * Portal utility for rendering modals outside the normal DOM hierarchy
 * This ensures modals are positioned relative to the viewport, not scrolling containers
 */

import React from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  container?: Element | null;
}

export const Portal: React.FC<PortalProps> = ({ 
  children, 
  container = typeof document !== 'undefined' ? document.body : null 
}) => {
  if (!container) return null;
  return createPortal(children, container);
};

export default Portal;
