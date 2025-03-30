import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
export default function AdminPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
