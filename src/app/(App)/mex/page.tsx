import { Metadata } from "next";
import MarkdownRenderer from "@/components/ui/markdown-renderer";

export const metadata: Metadata = {
  title: "Markdown Example | Utkarsh Chaudhary",
  description: "Example page showcasing markdown rendering capabilities",
};

const markdownExample = `
# Markdown Renderer Demo

This page demonstrates the capabilities of the custom Markdown renderer component.

## Text Formatting

*This text is italicized*

**This text is bold**

~~This text is strikethrough~~

## Lists

### Unordered List

- Item 1
- Item 2
  - Nested Item 1
  - Nested Item 2
- Item 3

### Ordered List

1. First item
2. Second item
3. Third item

### Task List

- [x] Completed task
- [ ] Incomplete task

## Code

Inline code: \`const greeting = "Hello, world!";\`

\`\`\`javascript
// This is a code block with syntax highlighting
function sayHello() {
  console.log("Hello, world!");
  return true;
}

// Call the function
sayHello();
\`\`\`

## Blockquotes

> This is a blockquote.
> 
> It can span multiple lines.

## Tables

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

## Links and Images

[Visit GitHub](https://github.com)

![Example Image](https://via.placeholder.com/300x200)

## Horizontal Rule

---

## Math Rendering

This is an inline equation: $E = mc^2$

Block equation:

$$
\\frac{d}{dx}\\left( \\int_{a}^{x} f(u)\\,du\\right)=f(x)
$$

## Custom Styling

The markdown renderer includes custom styling for:
- Code syntax highlighting
- Table formatting
- Task lists
- Math equations
- Responsive images
- And more!
`;

export default function MarkdownExamplePage() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold mb-8'>Markdown Renderer Example</h1>
        <div className='bg-card rounded-lg p-6 shadow-md'>
          <MarkdownRenderer content={markdownExample} />
        </div>
      </div>
    </div>
  );
}
