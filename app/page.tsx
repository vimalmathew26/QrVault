// app/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import VaultDisplay from '@/components/custom/VaultDisplay';
import { QrCode, ScanLine } from 'lucide-react'; // Some nice icons

export default function HomePage() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-4xl font-bold">QRVault</h1>
          <p className="text-muted-foreground">
            Create, scan, and manage your QR codes with ease.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/create">
              <QrCode className="mr-2 h-4 w-4" /> Create New
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/scan">
              <ScanLine className="mr-2 h-4 w-4" /> Scan Code
            </Link>
          </Button>
        </div>
      </div>

      <VaultDisplay />
    </main>
  );
}