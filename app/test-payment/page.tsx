'use client';

import { useState } from 'react';
import { PaymentModal, PaymentAction } from '@/components/PaymentModal';

export default function TestPaymentPage() {
  const [action, setAction] = useState<PaymentAction | null>(null);

  const actions: PaymentAction[] = ['fuel', 'inject', 'call', 'claim'];

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <h1 className="text-2xl font-mono text-zinc-100 mb-8">Payment Modal Test</h1>
      
      <div className="flex flex-wrap gap-4">
        {actions.map((a) => (
          <button
            key={a}
            onClick={() => setAction(a)}
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-mono uppercase rounded-lg transition-colors"
          >
            Test {a}
          </button>
        ))}
      </div>

      {action && (
        <PaymentModal
          action={action}
          stationName="Test Station"
          injectMessage={action === 'inject' ? 'This is a test inject message' : undefined}
          onConfirm={() => {
            console.log(`${action} confirmed!`);
            setAction(null);
          }}
          onCancel={() => setAction(null)}
        />
      )}
    </div>
  );
}
