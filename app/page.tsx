import QRScanner from "@/components/qr-scanner";
import { Header } from "./header";



export default function Home() {
  return (
    <main className="">
      <div className="">
            <Header />
            <main className="">
                <QRScanner />
            </main>
        </div> 
     
    </main>
  );
}
