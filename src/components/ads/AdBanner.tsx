import { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { IAd } from "@/lib/types";
import {
  useTrackImpression,
  useTrackClick,
} from "@/lib/api/services/adService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AdBannerProps {
  ad: IAd | null;
  onClose: () => void;
}

export function AdBanner({ ad, onClose }: AdBannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: trackImpression } = useTrackImpression();
  const { mutate: trackClick } = useTrackClick();

  useEffect(() => {
    // If ad exists, show the banner and track impression
    if (ad) {
      setIsOpen(true);
      trackImpression(ad._id as string);
    }
  }, [ad, trackImpression]);

  const handleClickCTA = () => {
    // Track click before navigating to CTA URL
    if (ad) {
      trackClick(ad._id as string);
      // Open in new tab
      window.open(ad.cta_url, "_blank");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Notify parent that ad was closed
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  // Handle click outside the ad
  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the backdrop, not the card itself
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!ad || !isOpen) return null;

  return (
    <div
      className='fixed inset-0 bg-black/70 z-50 flex items-center justify-center transition-opacity duration-300 ease-in-out'
      onClick={handleOutsideClick}
    >
      <Card className='w-full max-w-lg mx-auto bg-white dark:bg-gray-900 overflow-hidden shadow-xl transform transition-all'>
        <div className='relative'>
          {/* Close button */}
          <button
            onClick={handleClose}
            className='absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 z-10'
            aria-label='Close advertisement'
          >
            <X className='h-4 w-4' />
          </button>

          {/* Ad image */}
          <div className='relative h-48 w-full'>
            <Image
              src={ad.image}
              alt={ad.title}
              fill
              className='object-cover'
              priority
            />
          </div>

          <CardContent className='p-4'>
            <h3 className='text-xl font-semibold mb-3'>{ad.title}</h3>

            <Button
              onClick={handleClickCTA}
              className='w-full'
              variant='default'
            >
              Learn More
            </Button>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
