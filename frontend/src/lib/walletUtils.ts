import { Wallet as WalletIcon, Smartphone, Landmark, Banknote, Package } from "lucide-react"

export const getWalletBrand = (name: string) => {
  const lower = name.toLowerCase();
  
  if (lower.includes('gcash')) {
    return { 
      icon: WalletIcon, 
      color: 'text-blue-600', 
      bg: 'bg-blue-100', 
      headerBg: 'bg-blue-600', 
      buttonColor: 'text-blue-600', 
      buttonBg: 'bg-blue-100',
      peer: 'peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600'
    };
  }
  if (lower.includes('maya')) {
    return { 
      icon: WalletIcon, 
      color: 'text-green-600', 
      bg: 'bg-green-100', 
      headerBg: 'bg-green-600', 
      buttonColor: 'text-green-600', 
      buttonBg: 'bg-green-100',
      peer: 'peer-checked:bg-green-600 peer-checked:text-white peer-checked:border-green-600'
    };
  }
  if (lower.includes('maribank')) {
    return { 
      icon: Landmark, 
      color: 'text-orange-500', 
      bg: 'bg-orange-100', 
      headerBg: 'bg-orange-500', 
      buttonColor: 'text-orange-500', 
      buttonBg: 'bg-orange-100',
      peer: 'peer-checked:bg-orange-500 peer-checked:text-white peer-checked:border-orange-500'
    };
  }
  if (lower.includes('cash')) {
    return { 
      icon: Banknote, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-100', 
      headerBg: 'bg-emerald-600', 
      buttonColor: 'text-emerald-600', 
      buttonBg: 'bg-emerald-100',
      peer: 'peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-600'
    };
  }
  if (lower.includes('auto-supply')) {
    return { 
      icon: Package, 
      color: 'text-zinc-600', 
      bg: 'bg-zinc-200', 
      headerBg: 'bg-zinc-700', 
      buttonColor: 'text-zinc-700', 
      buttonBg: 'bg-zinc-200',
      peer: 'peer-checked:bg-zinc-700 peer-checked:text-white peer-checked:border-zinc-700'
    };
  }
  if (lower.includes('load')) {
    return { 
      icon: Smartphone, 
      color: 'text-purple-600', 
      bg: 'bg-purple-100', 
      headerBg: 'bg-purple-600', 
      buttonColor: 'text-purple-600', 
      buttonBg: 'bg-purple-100',
      peer: 'peer-checked:bg-purple-600 peer-checked:text-white peer-checked:border-purple-600'
    };
  }
  
  // Default
  return { 
    icon: WalletIcon, 
    color: 'text-zinc-500', 
    bg: 'bg-zinc-100', 
    headerBg: 'bg-zinc-700', 
    buttonColor: 'text-zinc-700', 
    buttonBg: 'bg-zinc-200',
    peer: 'peer-checked:bg-zinc-600 peer-checked:text-white peer-checked:border-zinc-600'
  };
};
