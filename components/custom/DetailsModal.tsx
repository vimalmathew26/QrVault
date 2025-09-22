// components/custom/DetailsModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { IGeneratedCode } from '@/lib/models/GeneratedCode';
import { IScannedCode } from '@/lib/models/ScannedCode';
import { updateGeneratedCodeLabel, updateScannedCodeNote } from '@/lib/actions';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// 1. Add `onUpdateSuccess` to the props interface
interface DetailsModalProps {
  code: IGeneratedCode | IScannedCode | null;
  isOpen: boolean;
  onClose: () => void;
  qrImageUrl: string;
  onUpdateSuccess: () => void;
}

export function DetailsModal({ code, isOpen, onClose, qrImageUrl, onUpdateSuccess }: DetailsModalProps) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (code) {
      if ('label' in code) { // It's a GeneratedCode
        setInputValue(code.label || '');
      } else if ('note' in code) { // It's a ScannedCode
        setInputValue(code.note || '');
      } else {
        setInputValue('');
      }
    }
  }, [code]);

  const handleSave = async () => {
    if (!code) return;

    let result;
    if ('label' in code) {
      result = await updateGeneratedCodeLabel(code._id as string, inputValue);
    } else {
      result = await updateScannedCodeNote(code._id as string, inputValue);
    }

    if (result.success) {
      toast.success(result.message);
      onUpdateSuccess(); // 2. Call the passed-in refresh function on success
      onClose();
    } else {
      toast.error(result.message);
    }
  };

  if (!code) return null;

  const isGenerated = 'label' in code;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isGenerated ? 'Generated Code Details' : 'Scanned Code Details'}</DialogTitle>
          <DialogDescription>
            View details and update the {isGenerated ? 'label' : 'note'}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-center">
            {qrImageUrl ? (
              <img src={qrImageUrl} alt="QR Code" className="w-48 h-48 rounded-md" />
            ) : (
              <div className="w-48 h-48 bg-gray-200 animate-pulse rounded-md"></div>
            )}
          </div>
          <div>
            <Label>Data</Label>
            <p className="text-sm font-mono p-2 bg-muted rounded-md break-all">{code.data}</p>
          </div>
          <div>
            <Label htmlFor="edit-field">{isGenerated ? 'Label' : 'Note'}</Label>
            {isGenerated ? (
              <Input id="edit-field" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
            ) : (
              <Textarea id="edit-field" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}