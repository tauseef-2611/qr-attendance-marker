"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';

const QRScanner: React.FC = () => {
  type QRData = {
    voter_id: string;
    name: string;
    phone: string;
    year_of_membership: number;
    date_of_birth: string;
    unit: string;
    area: string;
    is_verified: boolean;
    is_Present: boolean;
    vote_Casted: boolean;
  };

  const [qrData, setQrData] = useState<QRData | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [marked, setMarked] = useState(false);

  const startQrScanner = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      console.log("Camera devices found:", devices);
      if (devices && devices.length) {
        const backCamera = devices.find(device => device.label.toLowerCase().includes('back')) || devices[0];
        console.log("Using camera:", backCamera);
        html5QrCodeRef.current = new Html5Qrcode("qr-reader");
        html5QrCodeRef.current.start(
          backCamera.id,
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => {
            console.log("QR Code detected:", decodedText);
            try {
              const parsedData: QRData = JSON.parse(decodedText);
              setQrData(parsedData);
              setTimestamp(new Date().toLocaleString());
              setIsDialogOpen(true);
              setCountdown(3);
              html5QrCodeRef.current?.stop().catch((error: any) => {
                console.error('Failed to stop QR code scanner', error);
              });
            } catch (error) {
              console.error("QR Code parse error:", error);
              // toast.error("Failed to parse QR code. Please try again.");
            }
          },
          (error: any) => {
            console.error("QR Code scan error:", error);
            // toast.error("Failed to scan QR code. Please try again.");
          }
        );
      }
    } catch (error) {
      console.error('Error accessing camera', error);
      toast.error("Error accessing camera. Please check your camera permissions.");
    }
  };

  useEffect(() => {
    startQrScanner();

    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch((error: any) => {
          console.error('Failed to stop QR code scanner', error);
        });
      }
    };
  }, []);

  useEffect(() => {
    if (isDialogOpen) {
      const interval = setInterval(async () => {
        setCountdown(prev => {
          if (prev === 1) {
            setIsDialogOpen(false);
            setQrData(null);
            setTimestamp(null);
            startQrScanner();
            clearInterval(interval);
            return 3;
          }
          return prev - 1;
        });

        if (countdown === 1 && qrData) {
          try {
            if(!qrData.voter_id) {
              toast.error("Invalid QR Code. Please try again.");
              return;
            }
            const res = await axios.get(`/api/mark-present/${qrData.voter_id}`);
            if (res.data.present) {
              setMarked(true);
              toast.success("Attendance marked successfully for " + qrData.name);
            } else {
              // toast.error("Something went wrong. Please try again");
              toast.error("Invalid QR Code. Please try again.");
            }
          } catch (err) {
            console.error(err);
            // toast.error("Something went wrong. Please try again");
          }
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isDialogOpen, countdown, qrData]);

  const handleCancel = () => {
    setIsDialogOpen(false);
    setQrData(null);
    setTimestamp(null);
    startQrScanner();
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border border-gray-300 rounded-lg shadow-lg">
        <CardContent className="flex justify-center items-center">
          <div id="qr-reader" className="w-full aspect-square border border-gray-300 rounded-lg"></div>
        </CardContent>
      </Card>
      {qrData && (
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger asChild>
            <button className="hidden">Open Dialog</button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <div className="relative p-6">
              <AlertDialogTitle>
                <div className="py-3">
                  <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-blue-300 transition-all duration-1000" style={{ width: `${(countdown / 3) * 100}%` }}></div>
                </div>
              </AlertDialogTitle>
              <AlertDialogDescription className="flex flex-col items-center">
                <p className="text-lg font-semibold text-blue-500">Marking attendance for:</p>
                <p className="mt-2 text-gray-700 dark:text-gray-300">Name: {qrData.name} </p>
                <p className="text-gray-700 dark:text-gray-300">Area: {qrData.area} </p>
                <Button 
                  onClick={handleCancel} 
                  className="mt-4"
                  variant="destructive"
                >
                  Cancel
                </Button>
              </AlertDialogDescription>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default QRScanner;