// components/custom/VaultDisplay.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import QRCode from 'qrcode';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DetailsModal } from './DetailsModal'; // Import the modal
import { IGeneratedCode } from '@/lib/models/GeneratedCode';
import { IScannedCode } from '@/lib/models/ScannedCode';
import { Link as LinkIcon, QrCode, StickyNote } from 'lucide-react'; // Renamed Link to avoid conflict

export default function VaultDisplay() {
  // Original Data State
  const [generatedCodes, setGeneratedCodes] = useState<IGeneratedCode[]>([]);
  const [scannedCodes, setScannedCodes] = useState<IScannedCode[]>([]);

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  
  // Modal State
  const [selectedCode, setSelectedCode] = useState<IGeneratedCode | IScannedCode | null>(null);
  const [modalQrImage, setModalQrImage] = useState('');
  const [qrImages, setQrImages] = useState<Record<string, string>>({});

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [generatedRes, scannedRes] = await Promise.all([
        fetch('/api/generated'),
        fetch('/api/scanned'),
      ]);
      if (!generatedRes.ok || !scannedRes.ok) throw new Error('Failed to fetch data');
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


  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [generatedRes, scannedRes] = await Promise.all([
          fetch('/api/generated'),
          fetch('/api/scanned'),
        ]);
        if (!generatedRes.ok || !scannedRes.ok) throw new Error('Failed to fetch data');
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

  // Generate QR images for generated codes
  useEffect(() => {
    const generateQRCodes = async () => {
      const newQrImages: Record<string, string> = {};
      for (const code of generatedCodes) {
        try {
          const svgString = await QRCode.toString(code.data, {
            type: 'svg',
            color: { dark: code.foregroundColor, light: code.backgroundColor }
          });
          newQrImages[code._id as string] = `data:image/svg+xml;base64,${btoa(svgString)}`;
        } catch (error) {
          console.error('Failed to generate QR code:', error);
        }
      }
      setQrImages(newQrImages);
    };
    
    if (generatedCodes.length > 0) {
      generateQRCodes();
    }
  }, [generatedCodes]);

  // Generate QR for modal when a code is selected
  useEffect(() => {
    if (selectedCode) {
      const generateQR = async () => {
        const url = await QRCode.toDataURL(selectedCode.data, {
            width: 256,
            margin: 2,
            color: {
              dark: 'foregroundColor' in selectedCode ? selectedCode.foregroundColor : '#000000',
              light: 'backgroundColor' in selectedCode ? selectedCode.backgroundColor : '#ffffff',
            },
        });
        setModalQrImage(url);
      }
      generateQR();
    }
  }, [selectedCode]);

  useEffect(() => {
    fetchData();
  }, []);

  // Memoized lists for search and sort
  const filteredAndSortedGenerated = useMemo(() => {
    return generatedCodes
      .filter(code =>
        (code.label?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (code.data.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a, b) => {
        if (sortOrder === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortOrder === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortOrder === 'az') return (a.label || '').localeCompare(b.label || '');
        if (sortOrder === 'za') return (b.label || '').localeCompare(a.label || '');
        return 0;
      });
  }, [generatedCodes, searchTerm, sortOrder]);

  const filteredAndSortedScanned = useMemo(() => {
    return scannedCodes
      .filter(code =>
        (code.note?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (code.data.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a, b) => {
        if (sortOrder === 'newest') return new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime();
        if (sortOrder === 'oldest') return new Date(a.scannedAt).getTime() - new Date(b.scannedAt).getTime();
        return 0;
      });
  }, [scannedCodes, searchTerm, sortOrder]);

  const renderContent = (codes: (IGeneratedCode | IScannedCode)[], type: 'generated' | 'scanned') => {
    // ... This is now split into two dedicated render functions below ...
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Input
          placeholder="Search by label, note, or data..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Date: Newest</SelectItem>
            <SelectItem value="oldest">Date: Oldest</SelectItem>
            <SelectItem value="az">Label: A-Z</SelectItem>
            <SelectItem value="za">Label: Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="generated" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generated">Generated</TabsTrigger>
          <TabsTrigger value="scanned">Scanned</TabsTrigger>
        </TabsList>
        <TabsContent value="generated">
            {/* ... Render logic for generated codes ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                {filteredAndSortedGenerated.map((code) => (
                    <Card key={code._id as string} onClick={() => setSelectedCode(code)} className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="truncate">{code.label || 'Untitled'}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            {qrImages[code._id as string] ? (
                              <img src={qrImages[code._id as string]} alt={code.label || 'QR'} className="w-32 h-32"/>
                            ) : (
                              <div className="w-32 h-32 bg-gray-200 animate-pulse rounded-md"></div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
            {filteredAndSortedGenerated.length === 0 && !isLoading && <p className="text-center mt-4 text-muted-foreground">No matching codes found.</p>}
        </TabsContent>
        <TabsContent value="scanned">
            {/* ... Render logic for scanned codes ... */}
            <div className="space-y-4 mt-4">
                {filteredAndSortedScanned.map((code) => (
                    <Card key={code._id as string} onClick={() => setSelectedCode(code)} className="cursor-pointer hover:shadow-lg transition-shadow">
                        <CardContent className="pt-6">
                           {/* ... same as before ... */}
                           <div className="flex items-start gap-4">
                              <div className="bg-muted p-3 rounded-md"><QrCode className="w-6 h-6" /></div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground"><LinkIcon className="w-4 h-4" /><span className="font-semibold">Data</span></div>
                                <p className="text-lg font-mono break-all">{code.data}</p>
                                {code.note && <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground"><StickyNote className="w-4 h-4 mt-1 flex-shrink-0" /><p className="italic">{code.note}</p></div>}
                              </div>
                              <div className="text-right text-xs text-muted-foreground">{new Date(code.scannedAt).toLocaleString()}</div>
                           </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {filteredAndSortedScanned.length === 0 && !isLoading && <p className="text-center mt-4 text-muted-foreground">No matching codes found.</p>}
        </TabsContent>
      </Tabs>

       <DetailsModal 
        isOpen={!!selectedCode}
        onClose={() => setSelectedCode(null)}
        code={selectedCode}
        qrImageUrl={modalQrImage}
        onUpdateSuccess={fetchData} // <--- PASS THE FUNCTION HERE
      />
    </>
  );
}