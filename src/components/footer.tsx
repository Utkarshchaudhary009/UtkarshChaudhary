'use client';

import { usePersonalDetails } from '@/lib/api/services/meService';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Link as LucideLinkIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  Linkedin as LinkedinIcon,
  Github as GithubIcon,
} from 'lucide-react';

const quickLinks = [
  { name: "Home", path: "/home" },
  { name: "About", path: "/about" },
  { name: "Projects", path: "/projects" },
  { name: "Blog", path: "/blog" },
  { name: "Contact", path: "/contact" },
];

const getSocialIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'facebook':
      return <FacebookIcon className="h-4 w-4" />;
    case 'twitter':
      return <TwitterIcon className="h-4 w-4" />;
    case 'instagram':
      return <InstagramIcon className="h-4 w-4" />;
    case 'linkedin':
      return <LinkedinIcon className="h-4 w-4" />;
    case 'github':
      return <GithubIcon className="h-4 w-4" />;
    default:
      return <LucideLinkIcon className="h-4 w-4" />;
  }
};

export default function Footer() {
  // Using TanStack Query instead of useState and useEffect
  const { data: personalDetails, isLoading, error } = usePersonalDetails();

  return (
    <footer className="bg-gray-100 dark:bg-gray-800 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start">
        {/* Left Section: Name and Bio */}
        <div className="md:text-left">
          {isLoading ? (
            <>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </>
          ) : personalDetails ? (
            <>
              {personalDetails.name && <h6 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">{personalDetails.name}</h6>}
              {personalDetails.bio && <p className="text-sm">{personalDetails.bio}</p>}
            </>
          ) : (
            <p>Information not available.</p>
          )}
        </div>

        {/* Middle Section: Quick Links */}
        <div className="md:text-left">
          <h6 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Quick Links</h6>
          <ul className="list-none p-0">
            {quickLinks.map((link) => (
              <li key={link.name} className="mb-1">
                <Link href={link.path} className="hover:underline">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Section: Follow Me and Social Links */}
        <div className="md:text-left">
          <h6 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Follow Me</h6>
          <div className="flex flex-col items-start">
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-32 mb-1" />
                <Skeleton className="h-6 w-32 mb-1" />
              </>
            ) : personalDetails?.socialLinks && personalDetails.socialLinks.length > 0 ? (
              personalDetails.socialLinks.map((link) => (
                <Link
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-1 hover:underline flex items-center space-x-2"
                >
                  {getSocialIcon(link.platform)}
                  <span>{link.name || link.platform}</span>
                </Link>
              ))
            ) : (
              <p>Social links not available.</p>
            )}
          </div>
        </div>

        {/* Bottom Section: Copyright */}
        <div className="col-span-1 md:col-span-3 lg:col-span-4 mt-4">
          <hr className="my-4 border-gray-200 dark:border-gray-700" />
          <p>
            © {isLoading ? <Skeleton className="inline-block h-4 w-20" /> : personalDetails?.name || 'Your Name'}{' '}
            {new Date().getFullYear()}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}