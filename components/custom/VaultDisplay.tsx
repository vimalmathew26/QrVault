// components/custom/VaultDisplay.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import QRCode from 'qrcode';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DetailsModal } from './DetailsModal';
import { IGeneratedCode } from '@/lib/models/GeneratedCode';
import { IScannedCode } from '@/lib/models/ScannedCode';
import { Link as LinkIcon, QrCode, StickyNote } from 'lucide-react';

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
  const [generatedQrCodes, setGeneratedQrCodes] = useState<{ [key: string]: string }>({});

  // 1. Create a reusable function to fetch data
  const fetchData = async () => {
    // We don't set loading to true here to avoid a jarring flash on refresh
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
      // Only set loading to false on the initial load
      if(isLoading) setIsLoading(false);
    }
  };

  // 2. Call fetchData on initial component mount
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <div className="space-y-8">
      {/* Search and Filter Bar */}
      <div className="bg-card shadow-sm border rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <Input
              placeholder="Search by label, note, or data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="relative z-10">
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="absolute w-[200px]">
                <SelectItem value="newest">Date: Newest</SelectItem>
                <SelectItem value="oldest">Date: Oldest</SelectItem>
                <SelectItem value="az">Label: A-Z</SelectItem>
                <SelectItem value="za">Label: Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="generated" className="w-full">
        <TabsList className="w-full max-w-md mx-auto mb-6">
          <TabsTrigger value="generated" className="flex-1">Generated</TabsTrigger>
          <TabsTrigger value="scanned" className="flex-1">Scanned</TabsTrigger>
        </TabsList>

        {/* Generated Codes Grid */}
        <TabsContent value="generated">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredAndSortedGenerated.map((code) => (
              <Card 
                key={code._id as string} 
                onClick={() => setSelectedCode(code)} 
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-2"
              >
                <CardHeader className="space-y-4">
                  <CardTitle className="text-xl truncate">{code.label || 'Untitled'}</CardTitle>
                  <div className="bg-muted aspect-square rounded-lg p-6 flex items-center justify-center">
                    {generatedQrCodes[code._id as string] && (
                      <img 
                        src={`data:image/svg+xml;base64,${btoa(generatedQrCodes[code._id as string])}`} 
                        alt={code.label || 'QR'} 
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Scanned Codes List */}
        <TabsContent value="scanned">
          <div className="space-y-4">
            {filteredAndSortedScanned.map((code) => (
              <Card 
                key={code._id as string} 
                onClick={() => setSelectedCode(code)} 
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.01] border-2"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <div className="bg-muted p-4 rounded-lg">
                      <QrCode className="w-8 h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <LinkIcon className="w-4 h-4" />
                        <span className="font-medium">Data</span>
                      </div>
                      <p className="text-lg font-mono break-all">{code.data}</p>
                      {code.note && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground mt-4">
                          <StickyNote className="w-4 h-4 mt-1 flex-shrink-0" />
                          <p className="italic">{code.note}</p>
                        </div>
                      )}
                    </div>
                    <time className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(code.scannedAt).toLocaleDateString()}
                    </time>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Empty States */}
        {(filteredAndSortedGenerated.length === 0 || filteredAndSortedScanned.length === 0) && !isLoading && (
          <p className="text-center mt-8 text-muted-foreground text-lg">
            No matching codes found.
          </p>
        )}
      </Tabs>

      {/* Keep the modal component */}
      <DetailsModal 
        isOpen={!!selectedCode}
        onClose={() => setSelectedCode(null)}
        code={selectedCode}
        qrImageUrl={modalQrImage}
        onUpdateSuccess={fetchData}
      />
    </div>
  );
}