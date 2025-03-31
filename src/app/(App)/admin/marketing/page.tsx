"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { IMarketingMail } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function MarketingPage() {
  const [marketingMails, setMarketingMails] = useState<IMarketingMail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketingMails = async () => {
      try {
        const response = await fetch("/api/admin/marketing-mails");

        if (!response.ok) {
          throw new Error("Failed to fetch marketing subscribers");
        }

        const data = await response.json();
        setMarketingMails(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMarketingMails();
  }, []);

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-200'>
        <h2 className='text-lg font-semibold mb-2'>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Marketing Email Subscribers</h1>
        <p className='text-muted-foreground'>
          Manage users who have subscribed to receive marketing emails about new
          blog posts and projects.
        </p>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableCaption>
            A list of all marketing email subscribers.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {marketingMails.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className='text-center py-6 text-muted-foreground'
                >
                  No subscribers found
                </TableCell>
              </TableRow>
            ) : (
              marketingMails.map((mail) => (
                <TableRow key={mail._id}>
                  <TableCell className='font-medium'>{mail.name}</TableCell>
                  <TableCell>{mail.email}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        mail.hasConsented
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                      }`}
                    >
                      {mail.hasConsented ? "Subscribed" : "Unsubscribed"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(mail.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
