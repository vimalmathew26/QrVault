// components/custom/CreateForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useActionState } from 'react'; // CORRECT: useActionState
import { createGeneratedCode, CreateFormState } from '@/lib/actions'; // Import the type
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import QRCode from 'qrcode';
import { useRouter } from 'next/navigation';

const initialState: CreateFormState = {
  error: undefined,
  success: false,
  message: '',
};

export function CreateForm() {
  const [state, formAction] = useActionState(createGeneratedCode, initialState);
  const [data, setData] = useState('');
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (data) {
      const generateQR = async () => {
        try {
          const svgString = await QRCode.toString(data, {
            type: 'svg',
            color: { dark: foregroundColor, light: backgroundColor },
            width: 256
          });
          setQrCodeDataUrl('data:image/svg+xml;base64,' + btoa(svgString));
        } catch (err) {
          console.error(err);
        }
      };
      generateQR();
    } else {
      setQrCodeDataUrl('');
    }
  }, [data, foregroundColor, backgroundColor]);
  
  useEffect(() => {
    if (state.success) {
      toast.success("Success!", { description: state.message });
      router.push('/');
    } else if (state.error) {
       toast.error("Error", { 
         description: typeof state.error === 'string' ? state.error : "Please check the form for errors."
       });
    }
  }, [state, router]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Create QR Code</CardTitle>
          <CardDescription>Enter your data and customize the look.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div>
              <Label htmlFor="data">Data (URL or Text)</Label>
              <Input id="data" name="data" required value={data} onChange={(e) => setData(e.target.value)} />
              {/* Display validation errors */}
              {typeof state.error !== 'string' && state.error?.data && <p className="text-sm text-red-500 mt-1">{state.error.data[0]}</p>}
            </div>
            <div>
              <Label htmlFor="label">Label (Optional)</Label>
              <Input id="label" name="label" placeholder="e.g., My Portfolio" />
            </div>
            <div className="flex gap-4">
              <div className="w-full">
                <Label htmlFor="foregroundColor">Color</Label>
                <Input id="foregroundColor" name="foregroundColor" type="color" value={foregroundColor} onChange={(e) => setForegroundColor(e.target.value)} />
              </div>
              <div className="w-full">
                <Label htmlFor="backgroundColor">Background</Label>
                <Input id="backgroundColor" name="backgroundColor" type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
              </div>
            </div>
            <Button type="submit" className="w-full">Save to Vault</Button>
          </form>
        </CardContent>
      </Card>
      
      <Card className="flex flex-col items-center justify-center p-6 bg-muted/30">
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          {qrCodeDataUrl ? (
            <img src={qrCodeDataUrl} alt="Generated QR Code" className="w-64 h-64" />
          ) : (
            <div className="w-64 h-64 bg-gray-200 rounded-md flex items-center justify-center text-center p-4">
              <p className="text-muted-foreground">Enter data to see a preview</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}