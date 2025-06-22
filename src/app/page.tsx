"use client";
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 text-white flex flex-col pt-24">
      <div className="flex-1 flex items-center justify-center mt-[26px]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl font-bold mb-16 leading-tight relative">
              A{" "}
              <span className="relative">
                <span className="absolute -bottom-1 -right-1 text-[#535353]">
                  NEW
                </span>
                <span className="absolute -bottom-2 -right-2 text-[#333333]">
                  NEW
                </span>
                <span className="relative text-white">NEW</span>
              </span>{" "}
              WAY
              <br />
              of{" "}
              <span className="relative">
                <span className="absolute -bottom-1 -right-1 text-[#535353]">
                  LEARNING
                </span>
                <span className="absolute -bottom-2 -right-2 text-[#333333]">
                  LEARNING
                </span>
                <span className="relative text-white">LEARNING</span>
              </span>
            </h1>

            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-white">WHO ARE WE</h2>
              <p className="text-[#919191] text-lg leading-relaxed max-w-3xl mx-auto">
                GYFT is an AI-powered platform that generates personalized learning courses 
                tailored to your interests and skill level. We believe learning should be 
                accessible, engaging, and adaptive to each learner's unique journey.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-white">
                WHY CHOOSE US
              </h2>
              <p className="text-[#919191] text-lg leading-relaxed max-w-3xl mx-auto">
                Our AI technology creates comprehensive, structured courses on any topic you choose. 
                From beginner tutorials to advanced concepts, GYFT adapts to your learning style 
                and provides interactive, step-by-step guidance for mastering new skills.
              </p>
            </div>

            <Link href="/auth/signin">
              <Button
                variant="outline"
                className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:border-white/50 px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                GET STARTED
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
