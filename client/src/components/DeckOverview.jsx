import React from 'react';
import { cn } from '../lib/utils';

const colorMap = {
  W: "/mana-w.svg",
  R: "/mana-r.svg",
  U: "/mana-u.svg",
  B: "/mana-b.svg",
  G: "/mana-g.svg"
};


export function DeckOverview({ deck }) {
  return (
    <div className='flex flex-col justify-center items-center gap-2 border p-4 max-w-60'>
      <h2 className='text-center'>{deck.name}</h2>
      <img 
        src="/card-placeholder.png" className="max-w-48" />
      <div>
        {deck.colors.map((color) => (
          <img src={colorMap[color]} key={color} className="inline-block h-6 w-6 mx-1" />
        ))}
      </div>
      <p>{deck.createdBy.displayName}</p>
    </div>
  )
}