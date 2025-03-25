"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { useContacts } from "@/lib/api/services/contactService";
import { ClerkLoaded, ClerkLoading, useAuth } from "@clerk/nextjs";
import { Tabs,  TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactDetailsModal } from "./contact-details-modal";
import { ReplyModal } from "./reply-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

export default function InboxPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const router = useRouter();
  const { isLoaded } = useAuth();

  const { data: contacts, isLoading } = useContacts(
    statusFilter !== "all" ? { status: statusFilter } : {}
  );

  useEffect(() => {
   

    // Event listeners for modal triggers
    const handleViewDetails = (e: CustomEvent) => {
      setSelectedContact(e.detail.contact);
      setIsDetailsModalOpen(true);
    };

    const handleReply = (e: CustomEvent) => {
      setSelectedContact(e.detail.contact);
      setIsReplyModalOpen(true);
    };

    document.addEventListener(
      "view-contact-details",
      handleViewDetails as EventListener
    );
    document.addEventListener("reply-to-contact", handleReply as EventListener);

    return () => {
      document.removeEventListener(
        "view-contact-details",
        handleViewDetails as EventListener
      );
      document.removeEventListener(
        "reply-to-contact",
        handleReply as EventListener
      );
    };
  }, [isLoaded, router]);

  return (
    <>
      <ClerkLoading>
        <div className='container py-10'>
          <h1 className='text-2xl font-bold mb-6'>Loading...</h1>
          <div className='space-y-4'>
            <Skeleton className='h-10 w-[200px]' />
            <Skeleton className='h-[600px] w-full' />
          </div>
        </div>
      </ClerkLoading>

      <ClerkLoaded>
        <div className='container py-10'>
          <h1 className='text-2xl font-bold mb-6'>Inbox</h1>

          <Tabs
            defaultValue='all'
            onValueChange={setStatusFilter}
            className='mb-6'
          >
            <TabsList>
              <TabsTrigger value='all'>All</TabsTrigger>
              <TabsTrigger value='unread'>Unread</TabsTrigger>
              <TabsTrigger value='read'>Read</TabsTrigger>
              <TabsTrigger value='replied'>Replied</TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <Skeleton className='h-[600px] w-full' />
          ) : (
            <DataTable
              columns={columns}
              data={contacts || []}
            />
          )}

          {selectedContact && (
            <>
              <ContactDetailsModal
                open={isDetailsModalOpen}
                onOpenChange={setIsDetailsModalOpen}
                contact={selectedContact}
              />

              <ReplyModal
                open={isReplyModalOpen}
                onOpenChange={setIsReplyModalOpen}
                contact={selectedContact}
              />
            </>
          )}
        </div>
      </ClerkLoaded>
    </>
  );
}
