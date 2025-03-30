import { Metadata } from "next";
import SocialShare from "@/components/ui/social-share";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Social Share Demo | Utkarsh Chaudhary",
  description: "Demonstration of social sharing components",
};

export default function SocialShareDemo() {
  // Example URL and content
  const shareUrl = "https://www.example.com/blog/awesome-article";
  const title = "Check out this awesome article!";
  const imageUrl = "https://via.placeholder.com/1200x630";

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-5xl mx-auto'>
        <h1 className='text-4xl font-bold mb-6'>Social Share Components</h1>
        <p className='text-lg mb-8'>
          Showcase of different social sharing component variants built with
          React Share.
        </p>

        <Tabs defaultValue='default'>
          <TabsList className='mb-8 w-full justify-start'>
            <TabsTrigger value='default'>Default</TabsTrigger>
            <TabsTrigger value='outline'>Outline</TabsTrigger>
            <TabsTrigger value='floating'>Floating</TabsTrigger>
            <TabsTrigger value='compact'>Compact</TabsTrigger>
            <TabsTrigger value='custom'>Custom</TabsTrigger>
          </TabsList>

          <TabsContent value='default'>
            <Card>
              <CardHeader>
                <CardTitle>Default Style</CardTitle>
                <CardDescription>
                  Basic social sharing buttons with circular icons.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SocialShare
                  url={shareUrl}
                  title={title}
                  media={imageUrl}
                  hashtags={["react", "webdev"]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='outline'>
            <Card>
              <CardHeader>
                <CardTitle>Outline Style</CardTitle>
                <CardDescription>
                  Social sharing buttons with labels, ideal for sidebar or
                  footer.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SocialShare
                  url={shareUrl}
                  title={title}
                  media={imageUrl}
                  variant='outline'
                  hashtags={["react", "webdev"]}
                  showShareCount={false}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='floating'>
            <Card>
              <CardHeader>
                <CardTitle>Floating Style</CardTitle>
                <CardDescription>
                  Fixed position buttons that float on the side of the page.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='h-64 relative border border-dashed rounded-md p-4 flex items-center justify-center'>
                  <p className='text-muted-foreground'>
                    Scroll down to see floating share buttons on the right side
                  </p>
                  <SocialShare
                    url={shareUrl}
                    title={title}
                    media={imageUrl}
                    variant='floating'
                    hashtags={["react", "webdev"]}
                    showShareCount={false}
                    buttonSize={40}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='compact'>
            <Card>
              <CardHeader>
                <CardTitle>Compact Style</CardTitle>
                <CardDescription>
                  Expandable sharing buttons that start with a single button.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SocialShare
                  url={shareUrl}
                  title={title}
                  media={imageUrl}
                  hashtags={["react", "webdev"]}
                  compact={true}
                  showShareCount={false}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='custom'>
            <Card>
              <CardHeader>
                <CardTitle>Custom Style</CardTitle>
                <CardDescription>
                  Customized sharing buttons with specific platforms and
                  styling.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SocialShare
                  url={shareUrl}
                  title={title}
                  media={imageUrl}
                  hashtags={["react", "webdev"]}
                  platforms={["facebook", "twitter", "linkedin", "whatsapp"]}
                  buttonSize={48}
                  round={false}
                  iconBgStyle={{ fill: "#1e293b" }}
                  iconFillColor='#ffffff'
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <h2 className='text-2xl font-bold my-8'>Usage</h2>
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle>Basic Implementation</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className='p-4 bg-muted rounded-md overflow-x-auto'>
              {`import SocialShare from "@/components/ui/social-share";

export default function MyPage() {
  return (
    <SocialShare
      url="https://example.com/my-page"
      title="My awesome page title"
      description="Check out this great content I found!"
      media="https://example.com/image.jpg"
      hashtags={["react", "nextjs"]}
    />
  );
}`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
