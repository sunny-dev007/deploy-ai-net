'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLock, FaShieldAlt } from 'react-icons/fa';

interface PasscodeModalProps {
  onAuthenticate: () => void;
}

const PasscodeModal: React.FC<PasscodeModalProps> = ({ onAuthenticate }) => {
  const [passcode, setPasscode] = useState(['', '', '', '']);
  const [passcodeError, setPasscodeError] = useState('');
  const CORRECT_PASSCODE = '2605';

  const handlePasscodeChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newPasscode = [...passcode];
      newPasscode[index] = value;
      setPasscode(newPasscode);

      if (value !== '' && index < 3) {
        const nextInput = document.getElementById(`passcode-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handlePasscodeSubmit = () => {
    const enteredPasscode = passcode.join('');
    if (enteredPasscode === CORRECT_PASSCODE) {
      onAuthenticate();
    } else {
      setPasscodeError('Invalid passcode. Please try again.');
      setPasscode(['', '', '', '']);
      document.getElementById('passcode-0')?.focus();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
      >
        <div className="text-center">
          <div className="mb-6 relative">
            <div className="absolute inset-0 flex items-center justify-center animate-pulse">
              <div className="w-20 h-20 bg-blue-500/10 rounded-full"></div>
            </div>
            <FaShieldAlt className="w-12 h-12 mx-auto text-blue-500 relative z-10" />
          </div>
          
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
          >
            Secure Access Required
          </motion.h2>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 dark:text-gray-400 mb-6"
          >
            Please enter your 4-digit passcode to continue
          </motion.p>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center gap-3 mb-6"
          >
            {passcode.map((digit, index) => (
              <motion.input
                key={index}
                id={`passcode-${index}`}
                type="password"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePasscodeChange(index, e.target.value)}
                className="w-14 h-14 text-center text-2xl font-bold rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !digit && index > 0) {
                    const prevInput = document.getElementById(`passcode-${index - 1}`);
                    prevInput?.focus();
                  }
                }}
                whileFocus={{ scale: 1.05 }}
                initial={{ scale: 1 }}
                animate={{ scale: 1 }}
              />
            ))}
          </motion.div>

          <AnimatePresence>
            {passcodeError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-500 mb-4 animate-shake"
              >
                {passcodeError}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={handlePasscodeSubmit}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaLock className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            Unlock Access
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default PasscodeModal; 
