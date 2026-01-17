import React from 'react';
import { cn } from '../lib/utils';

const colorMap = {
  W: "/mana-w.svg",
  R: "/mana-r.svg",
  U: "/mana-u.svg",
  B: "/mana-b.svg",
  G: "/mana-g.svg"
};
const deck = {
  name: "White Red Deck", 
  colors: ["R", "W"],
  mainboard: [
    { cardId: "card1", qty: 4 },
    { cardId: "card2", qty: 4 },
    { cardId: "card3", qty: 4 }
  ],
  createdBy: "user123"
}

export function DeckOverview() {
  return (
    <div className='flex flex-col justify-center items-center gap-2 border p-4 max-w-60 bg-mtg-red'>
      <h2>{deck.name}</h2>
      <img 
        src={deck.mainboard[0].cardId.img || "/card-placeholder.png"} className="max-w-48" />
      <div>
        {deck.colors.map((color) => (
          <img src={colorMap[color]} key={color} className="inline-block h-6 w-6 mx-1" />
        ))}
      </div>
      <p>{deck.createdBy}</p>
    </div>
  )
}