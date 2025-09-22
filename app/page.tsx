// app/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import VaultDisplay from '@/components/custom/VaultDisplay';
import { QrCode, ScanLine } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen max-w-screen-2xl mx-auto px-6 py-8 lg:px-12">
      <header className="mb-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight">
              QRVault
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Create, scan, and manage your QR codes with ease.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button asChild size="lg" className="min-w-[140px]">
              <Link href="/create" className="flex items-center">
                <QrCode className="mr-2 h-5 w-5" />
                Create New
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-w-[140px]">
              <Link href="/scan" className="flex items-center">
                <ScanLine className="mr-2 h-5 w-5" />
                Scan Code
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mt-8">
        <VaultDisplay />
      </main>
    </div>
  );
}