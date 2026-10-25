import React from 'react';
import * as Icons from 'lucide-react';

export default function DynamicIcon({ name, size = 24, color = 'currentColor', className = '' }) {
  const IconComponent = Icons[name] || Icons.CircleDot;
  return <IconComponent size={size} color={color} className={className} />;
}
