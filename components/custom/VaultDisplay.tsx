// components/custom/VaultDisplay.tsx
'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IGeneratedCode } from '@/lib/models/GeneratedCode';
import { IScannedCode } from '@/lib/models/ScannedCode';

export default function VaultDisplay() {
  const [generatedCodes, setGeneratedCodes] = useState<IGeneratedCode[]>([]);
  const [scannedCodes, setScannedCodes] = useState<IScannedCode[]>([]);
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

        const generatedData = await generatedRes.json();
        const scannedData = await scannedRes.json();

        setGeneratedCodes(generatedData);
        setScannedCodes(scannedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderContent = (codes: (IGeneratedCode | IScannedCode)[], type: 'generated' | 'scanned') => {
    if (isLoading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;
    if (codes.length === 0) return <p>No codes found. Try creating or scanning one!</p>;
    
    // For now, we'll just render the raw data to confirm it works
    return (
      <div className="space-y-4">
        {codes.map((code) => (
          <Card key={code._id as string}>
            <CardContent className="pt-6">
              <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto">
                {JSON.stringify(code, null, 2)}
              </pre>
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
            {renderContent(generatedCodes, 'generated')}
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
            {renderContent(scannedCodes, 'scanned')}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}