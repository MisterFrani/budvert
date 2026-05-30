import type { LucideIcon } from 'lucide-react'
import {
  Bike, Bot, Briefcase, Car, Dumbbell, Gamepad2, HeartPulse, Monitor,
  Paintbrush, Palette, Phone, ShoppingBag, ShoppingCart, Sparkles,
  Stethoscope, Tag, Tv, Zap,
} from 'lucide-react'
import type { SimpleIcon } from 'simple-icons'
import {
  siAirbnb, siAliexpress, siAnthropic, siApple, siApplemusic, siAppletv,
  siBereal, siBinance, siBookingdotcom, siCoinbase, siDeezer, siDeliveroo,
  siDiscord, siDropbox, siEbay, siExpedia, siFacebook, siFigma, siFnac,
  siGithub, siGooglegemini, siInstagram, siJusteat, siMcdonalds, siMetro,
  siN26, siNetflix, siNotion, siOrange, siPaypal, siPerplexity, siPinterest,
  siPlaystation, siReddit, siRevolut, siSncf, siSnapchat, siSoundcloud,
  siSpotify, siStarbucks, siSteam, siStripe, siTelegram, siTidal, siTiktok,
  siTwitch, siUber, siUbereats, siVinted, siWhatsapp, siX, siYoutube,
} from 'simple-icons'

type SimpleEntry = { type: 'simple'; icon: SimpleIcon }
type LucideEntry = { type: 'lucide'; icon: LucideIcon; color: string }
export type BrandEntry = SimpleEntry | LucideEntry

const si = (icon: SimpleIcon): SimpleEntry => ({ type: 'simple', icon })
const lu = (icon: LucideIcon, color: string): LucideEntry => ({ type: 'lucide', icon, color })

// Sorted most-specific keywords first to prevent short tokens shadowing long ones
const BRAND_ENTRIES: Array<{ keys: string[]; entry: BrandEntry }> = [
  // Télécom
  { keys: ['free mobile', 'freemobile'], entry: lu(Phone, '#CD2028') },
  { keys: ['sfr'], entry: lu(Phone, '#E2001A') },
  { keys: ['orange'], entry: si(siOrange) },
  { keys: ['bouygues', 'b&you', 'byou'], entry: lu(Phone, '#00A1DE') },
  { keys: ['sosh'], entry: lu(Phone, '#6B6B6B') },

  // Streaming vidéo (ordre : plus spécifique d'abord)
  { keys: ['netflix', 'netflix.com'], entry: si(siNetflix) },
  { keys: ['disney+', 'disney plus', 'disney', 'dsn+'], entry: lu(Tv, '#113CCF') },
  { keys: ['youtube premium', 'youtube'], entry: si(siYoutube) },
  { keys: ['amazon prime', 'prime video', 'primevideo'], entry: lu(Tv, '#00A8E0') },
  { keys: ['apple tv+', 'apple tv', 'appletv'], entry: si(siAppletv) },
  { keys: ['canal+', 'canal plus', 'canalplus'], entry: lu(Tv, '#000000') },
  { keys: ['twitch'], entry: si(siTwitch) },
  { keys: ['deezer'], entry: si(siDeezer) },

  // Streaming musique
  { keys: ['spotify'], entry: si(siSpotify) },
  { keys: ['apple music', 'applemusic'], entry: si(siApplemusic) },
  { keys: ['soundcloud'], entry: si(siSoundcloud) },
  { keys: ['tidal'], entry: si(siTidal) },

  // IA
  { keys: ['chatgpt', 'openai', 'open ai'], entry: lu(Bot, '#412991') },
  { keys: ['claude', 'anthropic'], entry: si(siAnthropic) },
  { keys: ['gemini', 'google ai'], entry: si(siGooglegemini) },
  { keys: ['grok', 'x ai'], entry: si(siX) },
  { keys: ['midjourney'], entry: lu(Sparkles, '#000000') },
  { keys: ['perplexity'], entry: si(siPerplexity) },

  // E-commerce (amazon prime avant amazon)
  { keys: ['amazon mktplace', 'amazon marketplace', 'amazon'], entry: lu(ShoppingCart, '#FF9900') },
  { keys: ['ebay'], entry: si(siEbay) },
  { keys: ['vinted'], entry: si(siVinted) },
  { keys: ['leboncoin'], entry: lu(Tag, '#F56B2A') },
  { keys: ['aliexpress'], entry: si(siAliexpress) },
  { keys: ['shein'], entry: lu(ShoppingBag, '#000000') },
  { keys: ['fnac'], entry: si(siFnac) },
  { keys: ['sephora'], entry: lu(ShoppingBag, '#000000') },

  // Tech / Abonnements (spécifiques Apple/Google/Microsoft avant les génériques)
  { keys: ['apple tv+', 'apple tv', 'apple music', 'apple one', 'icloud', 'apple.com'], entry: si(siApple) },
  { keys: ['apple'], entry: si(siApple) },
  { keys: ['google one', 'google'], entry: si(siGooglegemini) },
  { keys: ['microsoft 365', 'office 365', 'microsoft', 'office'], entry: lu(Monitor, '#00A4EF') },
  { keys: ['adobe'], entry: lu(Palette, '#FF0000') },
  { keys: ['ps plus', 'psn', 'playstation'], entry: si(siPlaystation) },
  { keys: ['game pass', 'xbox'], entry: lu(Gamepad2, '#107C10') },
  { keys: ['nintendo'], entry: lu(Gamepad2, '#E60012') },
  { keys: ['steam'], entry: si(siSteam) },
  { keys: ['github'], entry: si(siGithub) },
  { keys: ['notion'], entry: si(siNotion) },
  { keys: ['figma'], entry: si(siFigma) },
  { keys: ['canva'], entry: lu(Paintbrush, '#00C4CC') },
  { keys: ['dropbox'], entry: si(siDropbox) },
  { keys: ['linkedin'], entry: lu(Briefcase, '#0A66C2') },

  // Réseaux sociaux
  { keys: ['instagram'], entry: si(siInstagram) },
  { keys: ['snapchat'], entry: si(siSnapchat) },
  { keys: ['tiktok'], entry: si(siTiktok) },
  { keys: ['twitter', 'x.com'], entry: si(siX) },
  { keys: ['facebook', 'meta'], entry: si(siFacebook) },
  { keys: ['whatsapp'], entry: si(siWhatsapp) },
  { keys: ['telegram'], entry: si(siTelegram) },
  { keys: ['discord'], entry: si(siDiscord) },
  { keys: ['reddit'], entry: si(siReddit) },
  { keys: ['pinterest'], entry: si(siPinterest) },
  { keys: ['bereal'], entry: si(siBereal) },

  // Transport (uber eats avant uber)
  { keys: ['uber eats', 'ubereats', 'uber *eats'], entry: si(siUbereats) },
  { keys: ['uber'], entry: si(siUber) },
  { keys: ['navigo', 'ratp'], entry: si(siMetro) },
  { keys: ['sncf', 'ouigo', 'tgv', 'inoui'], entry: si(siSncf) },
  { keys: ['blablacar', 'bla bla car'], entry: lu(Car, '#00BFE9') },
  { keys: ['bolt'], entry: lu(Zap, '#34D186') },
  { keys: ['free2move', 'autolib'], entry: lu(Car, '#005BBB') },
  { keys: ['velib'], entry: lu(Bike, '#009640') },

  // Alimentation / Livraison
  { keys: ['deliveroo'], entry: si(siDeliveroo) },
  { keys: ['just eat', 'justeat'], entry: si(siJusteat) },
  { keys: ['mcdonalds', 'mcdonald', 'mc donald'], entry: si(siMcdonalds) },
  { keys: ['starbucks'], entry: si(siStarbucks) },

  // Banque / Finance
  { keys: ['paypal'], entry: si(siPaypal) },
  { keys: ['revolut'], entry: si(siRevolut) },
  { keys: ['n26'], entry: si(siN26) },
  { keys: ['sumeria', 'lydia'], entry: lu(Zap, '#6366F1') },
  { keys: ['stripe'], entry: si(siStripe) },
  { keys: ['coinbase'], entry: si(siCoinbase) },
  { keys: ['binance'], entry: si(siBinance) },

  // Santé / Bien-être
  { keys: ['doctolib'], entry: lu(Stethoscope, '#3B5FCA') },
  { keys: ['alan'], entry: lu(HeartPulse, '#00D4BE') },
  { keys: ['basic fit', 'basicfit', 'fitness park', 'neoness', 'gymlib'], entry: lu(Dumbbell, '#E30613') },
  { keys: ['bodyhit'], entry: lu(Zap, '#FF6B00') },

  // Voyage / Hébergement
  { keys: ['airbnb'], entry: si(siAirbnb) },
  { keys: ['booking', 'booking.com'], entry: si(siBookingdotcom) },
  { keys: ['expedia'], entry: si(siExpedia) },

  // Paris sportifs
  { keys: ['betclic', 'winamax', 'unibet', 'pmu', 'fdj', 'française des jeux'], entry: lu(Gamepad2, '#6366F1') },
]

export function matchBrand(text: string): BrandEntry | null {
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
  for (const { keys, entry } of BRAND_ENTRIES) {
    if (keys.some((k) => normalized.includes(k))) return entry
  }
  return null
}
