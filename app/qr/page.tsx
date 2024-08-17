"use client";
import QRScanner from "@/components/qr-scanner";
import { Button } from '@/components/ui/button';

export default function QRRead() {
    const handleLogout = () => {
        // Implement logout functionality here
        console.log("Logout clicked");
    };

    return (
        <div className="flex flex-col min-h-screen">
            <header className="bg-purple-500 text-white">
                <div className="container mx-auto flex justify-between items-center py-4">
                    <h1 className="text-xl font-bold">Intekhaab Attendance</h1>
                </div>
            </header>
            <main className="flex-grow flex items-center justify-center">
                <QRScanner />
            </main>
            <footer className="bg-gray-800 text-white py-4">
                <div className="container mx-auto flex justify-end">
                    <Button onClick={handleLogout} variant="destructive">
                        Logout
                    </Button>
                </div>
            </footer>
        </div>
    );
}