const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/transaction/new/TransactionForm.tsx', 'utf8');

// Add isOffline state
code = code.replace(
  'const [confirmChecked, setConfirmChecked] = useState(false)',
  'const [confirmChecked, setConfirmChecked] = useState(false)\n  const [isOffline, setIsOffline] = useState(false)'
);

// Add useEffect for network
const networkEffect = `
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsOffline(!navigator.onLine)
    }
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
`;
code = code.replace(
  '// Setup pre-selected wallet based on URL if available',
  networkEffect + '\n\n  // Setup pre-selected wallet based on URL if available'
);

// Update submit button
const buttonTarget = `<button
          type="submit"
          className={\`w-full \${activeBrand.solidBg} text-white rounded-[1.5rem] py-5 text-xl font-black uppercase tracking-widest active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 pointer-events-auto border-4 border-white shadow-xl \${activeBrand.shadow}\`}
        >
          REVIEW TRANSACTION
        </button>`;

const buttonReplacement = `<button
          type="submit"
          disabled={isOffline || isSubmitting}
          className={\`w-full \${isOffline ? 'bg-zinc-400' : activeBrand.solidBg} text-white rounded-[1.5rem] py-5 text-xl font-black uppercase tracking-widest active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 pointer-events-auto border-4 border-white shadow-xl \${!isOffline && activeBrand.shadow}\`}
        >
          {isOffline ? 'OFFLINE (WAITING...)' : 'REVIEW TRANSACTION'}
        </button>`;

code = code.replace(buttonTarget, buttonReplacement);

fs.writeFileSync('frontend/src/app/transaction/new/TransactionForm.tsx', code);
console.log('Patched TransactionForm.tsx');
