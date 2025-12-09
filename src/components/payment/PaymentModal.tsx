'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    price: number;
    courseTitle: string;
}

export function PaymentModal({ isOpen, onClose, onConfirm, price, courseTitle }: PaymentModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [cardError, setCardError] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');

    const handleConfirm = async () => {
        setCardError('');
        
        // Basic validation
        if (cardNumber.length < 16) {
            setCardError('Numero di carta non valido');
            return;
        }

        setIsLoading(true);
        
        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            await onConfirm();
            onClose();
        } catch (error) {
            console.error('Payment error:', error);
            setCardError('Si è verificato un errore durante il pagamento.');
        } finally {
            setIsLoading(false);
        }
    };

    // Format card number with spaces
    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 16) val = val.slice(0, 16);
        setCardNumber(val);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Completa il pagamento</DialogTitle>
                    <DialogDescription>
                        Inserisci i dettagli della carta per acquistare <strong>{courseTitle}</strong> a soli <strong>€{price}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Mock Card Preview */}
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-xl shadow-lg mb-4">
                        <div className="flex justify-between items-start mb-8">
                            <div className="text-xs opacity-75">Debit Card</div>
                            {/* Visa Icon Placeholder */}
                            <div className="font-bold italic text-lg">VISA</div>
                        </div>
                        <div className="text-xl tracking-widest mb-4 font-mono">
                            {cardNumber ? cardNumber.match(/.{1,4}/g)?.join(' ') : '•••• •••• •••• ••••'}
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-[10px] opacity-75 uppercase">Card Holder</div>
                                <div className="text-sm font-medium tracking-wide">STUDENTE DEMO</div>
                            </div>
                            <div>
                                <div className="text-[10px] opacity-75 uppercase">Expires</div>
                                <div className="text-sm font-medium tracking-wide">{expiry || 'MM/YY'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="cardNumber">Numero Carta</Label>
                        <Input
                            id="cardNumber"
                            placeholder="0000 0000 0000 0000"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            maxLength={16}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="expiry">Scadenza</Label>
                            <Input 
                                id="expiry" 
                                placeholder="MM/YY" 
                                value={expiry}
                                onChange={(e) => setExpiry(e.target.value)}
                                maxLength={5}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="cvc">CVC</Label>
                            <Input 
                                id="cvc" 
                                placeholder="123" 
                                value={cvc}
                                onChange={(e) => setCvc(e.target.value)}
                                maxLength={3}
                                type="password"
                            />
                        </div>
                    </div>

                    {cardError && (
                        <p className="text-sm text-red-500">{cardError}</p>
                    )}

                    <div className="bg-muted/50 p-3 rounded text-xs text-muted-foreground flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        Pagamento sicuro crittografato SSL a 256-bit
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>Annulla</Button>
                    <Button onClick={handleConfirm} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white">
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Elaborazione...
                            </>
                        ) : (
                            `Paga €${price}`
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
