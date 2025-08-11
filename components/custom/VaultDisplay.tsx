// components/custom/VaultDisplay.tsx
'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode'; // We need this to generate the QR images
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IGeneratedCode } from '@/lib/models/GeneratedCode';
import { IScannedCode } from '@/lib/models/ScannedCode';
import { Link, QrCode, StickyNote } from 'lucide-react'; // Import some icons

// Helper function to generate QR code image data
async function generateQRDataURL(code: IGeneratedCode): Promise<string> {
  try {
    return await QRCode.toDataURL(code.data, {
      width: 128,
      margin: 2,
      color: {
        dark: code.foregroundColor,
        light: code.backgroundColor,
      },
    });
  } catch (err) {
    console.error(err);
    return ''; // Return an empty string or a placeholder image URL on error
  }
}

export default function VaultDisplay() {
  const [generatedCodes, setGeneratedCodes] = useState<IGeneratedCode[]>([]);
  const [scannedCodes, setScannedCodes] = useState<IScannedCode[]>([]);
  const [qrImages, setQrImages] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [generatedRes, scannedRes] = await Promise.all([
          fetch('/api/generated'),
          fetch('/api/scanned'),
        ]);

        if (!generatedRes.ok || !scannedRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const generatedData: IGeneratedCode[] = await generatedRes.json();
        const scannedData: IScannedCode[] = await scannedRes.json();

        setGeneratedCodes(generatedData);
        setScannedCodes(scannedData);

        // Generate all QR code images after fetching data
        if (generatedData.length > 0) {
          const imagePromises = generatedData.map(code => 
            generateQRDataURL(code).then(url => ({ id: code._id as string, url }))
          );
          const images = await Promise.all(imagePromises);
          const imageMap = images.reduce((acc, img) => {
            acc[img.id] = img.url;
            return acc;
          }, {} as Record<string, string>);
          setQrImages(imageMap);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderGeneratedCodes = () => {
    if (isLoading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;
    if (generatedCodes.length === 0) return <p>No codes found. Try creating one!</p>;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {generatedCodes.map((code) => (
          <Card key={code._id as string}>
            <CardHeader>
              <CardTitle className="truncate">{code.label || 'Untitled'}</CardTitle>
              <CardDescription>
                {new Date(code.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {qrImages[code._id as string] ? (
                  <img
                    src={qrImages[code._id as string]}
                    alt={code.label || 'Generated QR Code'}
                    className="w-32 h-32 rounded-md"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 animate-pulse rounded-md"></div>
                )
              }
              <p className="text-xs text-muted-foreground break-all text-center">
                {code.data}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  const renderScannedCodes = () => {
    if (isLoading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;
    if (scannedCodes.length === 0) return <p>No codes found. Try scanning one!</p>;
    
    return (
        <div className="space-y-4">
            {scannedCodes.map((code) => (
                <Card key={code._id as string}>
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-muted p-3 rounded-md">
                                <QrCode className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Link className="w-4 h-4" />
                                    <span className="font-semibold">Data</span>
                                </div>
                                <p className="text-lg font-mono break-all">{code.data}</p>
                                {code.note && (
                                    <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                                        <StickyNote className="w-4 h-4 mt-1 flex-shrink-0" />
                                        <p className="italic">{code.note}</p>
                                    </div>
                                )}
                            </div>
                            <div className="text-right text-xs text-muted-foreground">
                                {new Date(code.scannedAt).toLocaleString()}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
  };


  return (
    <Tabs defaultValue="generated" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="generated">Generated</TabsTrigger>
        <TabsTrigger value="scanned">Scanned</TabsTrigger>
      </TabsList>
      <TabsContent value="generated">
        <Card>
          <CardHeader>
            <CardTitle>Generated QR Codes</CardTitle>
            <CardDescription>
              QR codes you have created and saved.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderGeneratedCodes()}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="scanned">
        <Card>
          <CardHeader>
            <CardTitle>Scanned QR Codes</CardTitle>
            <CardDescription>
              Your history of scanned QR codes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderScannedCodes()}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}