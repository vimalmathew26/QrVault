// components/custom/QRScanner.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useActionState } from 'react';
import { createScannedCode, ScanFormState } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import QrScanner from 'qr-scanner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Camera, Upload, XCircle, FileCheck2 } from 'lucide-react';

const initialState: ScanFormState = { error: undefined, success: false, message: '' };

export function QRScanner() {
  const [state, formAction] = useActionState(createScannedCode, initialState);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  const startScanner = async () => {
    if (videoRef.current) {
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          setScannedResult(result.data);
          stopScanner();
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
      try {
        await scannerRef.current.start();
        setIsScanning(true);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Camera not found or permission denied. Please check your browser settings.');
      }
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const result = await QrScanner.scanImage(file, { returnDetailedScanResult: true });
        setScannedResult(result.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('No QR code found in the image or the image is invalid.');
      }
    }
  };
  
  // Effect for handling form submission state
  useEffect(() => {
    if (state.success) {
      toast.success("Success!", { description: state.message });
      router.push('/');
    } else if (state.error) {
      toast.error("Error", { description: state.error });
    }
  }, [state, router]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  if (scannedResult) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileCheck2 /> Scan Successful</CardTitle>
          <CardDescription>Review the data and add a note before saving.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div>
              <Label>Scanned Data</Label>
              <div className="p-3 bg-muted rounded-md text-sm break-all">{scannedResult}</div>
              <input type="hidden" name="data" value={scannedResult} />
            </div>
            <div>
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea id="note" name="note" placeholder="e.g., Business card from conference" />
            </div>
            <div className="flex gap-2">
                <Button type="submit" className="w-full">Save to History</Button>
                <Button type="button" variant="outline" onClick={() => setScannedResult(null)} className="w-full">Scan Another</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Scan QR Code</CardTitle>
        <CardDescription>Use your camera or upload an image to scan a QR code.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
            <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        <div className="aspect-video bg-muted rounded-md flex items-center justify-center relative">
          <video ref={videoRef} className={`${isScanning ? 'block' : 'hidden'} w-full h-full`}></video>
          {!isScanning && <Camera className="w-16 h-16 text-muted-foreground" />}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {!isScanning ? (
            <Button onClick={startScanner} className="w-full">
              <Camera className="mr-2 h-4 w-4" /> Start Camera
            </Button>
          ) : (
            <Button onClick={stopScanner} variant="destructive" className="w-full">
              <XCircle className="mr-2 h-4 w-4" /> Stop Scanning
            </Button>
          )}
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full">
            <Upload className="mr-2 h-4 w-4" /> Upload Image
          </Button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
        </div>
      </CardContent>
    </Card>
  );
}