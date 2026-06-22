// components/AdsBanner.tsx

"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdsBannerProps {
  "data-ad-slot": string;
  "data-ad-format": string;
  "data-full-width-responsive": string;
  "data-ad-layout"?: string;
  isNSFW?: boolean; // Don't show ads on NSFW content for AdSense compliance
}

export default function AdsBanner(props: AdsBannerProps) {
  const { isNSFW, ...adProps } = props;
  const pathname = usePathname();

  // Don't render ads on NSFW content
  if (isNSFW) {
    return null;
  }

  useEffect(() => {
    const pushAd = () => {
      try {
        if (typeof window !== "undefined" && window.adsbygoogle) {
          window.adsbygoogle.push({});
        }
      } catch (err) {
        console.error("Error pushing ads:", err);
      }
    };

    // Delay to ensure DOM is ready
    const timeoutId = setTimeout(pushAd, 100);
    
    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return (
    <div className="ad-container">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID}
        {...adProps}
      />
      {process.env.NODE_ENV === "development" && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded text-sm text-center">
          📢 AdSense Placeholder - Real ads will show in production with valid ad slot IDs
        </div>
      )}
    </div>
  );
}
