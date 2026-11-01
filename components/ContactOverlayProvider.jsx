"use client";

import { createContext, useContext, useState } from 'react';
import ContactOverlay from '@/components/ContactOverlay';

const ContactOverlayContext = createContext({ open: () => {}, close: () => {} });

// Any section can open the contact overlay via `useContactOverlay().open()`.
export function useContactOverlay() {
    return useContext(ContactOverlayContext);
}

export default function ContactOverlayProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);
    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);

    return (
        <ContactOverlayContext.Provider value={{ open, close }}>
            {children}
            <ContactOverlay isOpen={isOpen} onClose={close} />
        </ContactOverlayContext.Provider>
    );
}
