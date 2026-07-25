/**
 * AI bot seed re-export for First Match compatibility.
 * Player-club XI comes from DB via resolveStartingXi — not from seedStarterSquad.
 */
export { seedBotSquad, type RosterPlayerSeed as StarterPlayerSeed } from '@/lib/squad';
