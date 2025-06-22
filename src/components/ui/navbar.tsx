"use client";
import Link from "next/link";
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;
        
        // Show navbar only when near the top of the page (within 100px)
        if (currentScrollY <= 10) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
        
        setLastScrollY(currentScrollY);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [lastScrollY]);

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const getInitials = () => {
    if (!session?.user) return '';
    return `${session.user.firstName?.[0] || ''}${session.user.lastName?.[0] || ''}`.toUpperCase();
  };

  const getUserDisplayName = () => {
    if (!session?.user) return 'Guest';
    return `${session.user.firstName} ${session.user.lastName}`;
  };

  return (
    <nav className={`fixed top-6 left-1/2 -translate-x-1/2 flex items-center justify-between p-4 bg-black/40 backdrop-blur-sm rounded-full border border-[#535353] shadow-lg z-50 min-w-[600px] transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-20'
    }`}>
      <Link href="/" className="text-xl font-bold text-white px-4">
        Gyft
      </Link>
      <div className="flex items-center space-x-8 px-4">
        <Link href="/dashboard" className="transition-colors hover:text-white">
          Dashboard
        </Link>
        <Link href="/gyfts" className="transition-colors hover:text-white">
          Gyfts
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger className="border border-[#535353] px-4 py-1.5 rounded-full text-white hover:bg-white hover:text-black transition-colors">
            {status === 'loading' ? 'Loading...' : (session?.user ? getUserDisplayName() : 'Guest')}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-black border border-[#535353] text-white">
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer hover:text-black hover:bg-white">
                My Account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="cursor-pointer hover:text-black hover:bg-white"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
