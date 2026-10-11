import React, { useState } from 'react';
import { ShieldAlert, X, Delete } from 'lucide-react';
import { sounds } from '../../services/soundService';

interface DiscreetModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  correctDuressPin: string;
  onSilentSosTriggered: () => void;
}

export const DiscreetModeModal: React.FC<DiscreetModeModalProps> = ({
  isOpen,
  onClose,
  correctDuressPin,
  onSilentSosTriggered,
}) => {
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [enteredPin, setEnteredPin] = useState('');
  const [sosFired, setSosFired] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    sounds.playClick();
    if (calcDisplay === '0') {
      setCalcDisplay(digit);
    } else {
      setCalcDisplay((prev) => (prev.length < 9 ? prev + digit : prev));
    }

    const nextPin = enteredPin + digit;
    setEnteredPin(nextPin);

    // Check if entered sequence matches duress PIN
    if (nextPin.includes(correctDuressPin)) {
      setSosFired(true);
      onSilentSosTriggered();
    }
  };

  const handleClear = () => {
    sounds.playClick();
    setCalcDisplay('0');
    setEnteredPin('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-4 font-mono select-none">
      {/* Harmless disguise header */}
      <div className="flex items-center justify-between text-slate-500 text-xs pt-2 px-2">
        <span>Standard Scientific Calc v2.4</span>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-500 hover:text-slate-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Calculator LCD display */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-right my-auto shadow-inner">
        <span className="text-slate-500 text-xs block mb-1">DEC</span>
        <span className="text-4xl sm:text-5xl font-mono font-bold text-slate-100 tracking-wider">
          {calcDisplay}
        </span>
        {sosFired && (
          <span className="block text-[10px] text-slate-600 mt-2 font-sans italic">
            [Silent duress beacon dispatched over BLE mesh]
          </span>
        )}
      </div>

      {/* Calculator Keypad */}
      <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto w-full pb-6">
        {['C', '±', '%', '÷'].map((btn) => (
          <button
            key={btn}
            onClick={btn === 'C' ? handleClear : () => {}}
            className="h-16 rounded-2xl bg-slate-800 text-slate-300 font-bold text-lg active:scale-95 transition-transform"
          >
            {btn}
          </button>
        ))}

        {['7', '8', '9', '×'].map((btn) => (
          <button
            key={btn}
            onClick={() => handleDigit(btn)}
            className="h-16 rounded-2xl bg-slate-900 text-white font-bold text-xl active:scale-95 transition-transform border border-slate-800"
          >
            {btn}
          </button>
        ))}

        {['4', '5', '6', '-'].map((btn) => (
          <button
            key={btn}
            onClick={() => handleDigit(btn)}
            className="h-16 rounded-2xl bg-slate-900 text-white font-bold text-xl active:scale-95 transition-transform border border-slate-800"
          >
            {btn}
          </button>
        ))}

        {['1', '2', '3', '+'].map((btn) => (
          <button
            key={btn}
            onClick={() => handleDigit(btn)}
            className="h-16 rounded-2xl bg-slate-900 text-white font-bold text-xl active:scale-95 transition-transform border border-slate-800"
          >
            {btn}
          </button>
        ))}

        <button
          onClick={() => handleDigit('0')}
          className="col-span-2 h-16 rounded-2xl bg-slate-900 text-white font-bold text-xl active:scale-95 transition-transform border border-slate-800 pl-6 text-left"
        >
          0
        </button>
        <button
          onClick={() => handleDigit('.')}
          className="h-16 rounded-2xl bg-slate-900 text-white font-bold text-xl active:scale-95 transition-transform border border-slate-800"
        >
          .
        </button>
        <button
          onClick={onClose}
          className="h-16 rounded-2xl bg-pink-700 text-white font-bold text-xl active:scale-95 transition-transform shadow-lg"
        >
          =
        </button>
      </div>

      <p className="text-center text-[10px] text-slate-600 pb-2">
        Enter your 4-digit duress PIN ({correctDuressPin}) to trigger silent SOS without audio alert.
      </p>
    </div>
  );
};
