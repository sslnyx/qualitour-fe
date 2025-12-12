import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/ui/Container';
import QualitourLogo from '@/assets/qualitour_logo.png';
import IataLogo from '@/assets/iata.png';

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-[#999]">
      <div className="py-16">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: Logo & IATA */}
            <div className="flex flex-col items-center md:items-center space-y-8">
              <Link href="/">
                <Image 
                  src={QualitourLogo}
                  alt="Qualitour"
                  width={180}
                  height={50}
                  className="w-[180px] h-auto"
                  style={{ width: 'auto', height: 'auto' }}
                />
              </Link>
              
              <Link href="https://www.iata.org/" target="_blank" rel="noopener noreferrer">
                <Image 
                  src={IataLogo}
                  alt="IATA"
                  width={60}
                  height={60}
                  className="w-[60px] h-auto"
                  style={{ width: 'auto', height: 'auto' }}
                />
              </Link>
            </div>

            {/* Column 2: Contact Us */}
            <div>
              <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-6">Contact Us</h3>
              <ul className="space-y-4 text-[15px]">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-white text-[22px]">call</span>
                  <a href="tel:778-945-6000" className="hover:text-[#f7941e] transition-colors text-white">778-945-6000</a>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-white text-[22px]">mail</span>
                  <a href="mailto:info@qualitour.ca" className="hover:text-[#f7941e] transition-colors text-white">info@qualitour.ca</a>
                </li>
              </ul>
            </div>

            {/* Column 3: Quick Links */}
            <div>
              <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-6">Quick Links</h3>
              <ul className="space-y-3 text-[15px]">
                <li><Link href="/tours" className="hover:text-[#f7941e] transition-colors">Tours</Link></li>
                <li><Link href="/about-us" className="hover:text-[#f7941e] transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-[#f7941e] transition-colors">Contact Us</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-[#f7941e] transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

            {/* Column 4: Booking.com Ad */}
            <div>
               {/* Placeholder for the ad image */}
               <div className="relative w-full max-w-[250px] aspect-square bg-blue-600 rounded overflow-hidden group cursor-pointer">
                  <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60')" }}></div>
                  <div className="relative z-10 p-6 flex flex-col h-full text-white text-center">
                    <p className="text-lg leading-tight mb-2">Holiday of your lifetime</p>
                    <p className="text-sm mb-4">Book a slice of paradise</p>
                    <div className="mt-auto">
                        <span className="inline-block bg-[#003580] text-white px-4 py-2 font-bold rounded mb-2">Book now</span>
                        <p className="font-bold text-xl">Booking.com</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#111] py-8 border-t border-[#222]">
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-[#666]">
            <p>Copyright © 2022 Qualitour Holiday Inc. All rights reserved. B.C. Reg. #62469</p>
            <div className="flex items-center gap-4">
              <span className="text-[#666]">Follow Us On</span>
              <a href="https://www.facebook.com/qualitour" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#f7941e] transition-colors"><i className="fa-brands fa-facebook text-[24px]"></i></a>
              <a href="https://www.instagram.com/qualitour" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#f7941e] transition-colors"><i className="fa-brands fa-instagram text-[24px]"></i></a>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
