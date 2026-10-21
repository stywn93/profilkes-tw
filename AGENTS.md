# Agent Workflow

For every new task:

1. Do not modify anything before approval!
2. Always prompt user to create a new branch or stick to the current branch!
3. Always verify user before making any decision! Don't decide anything yourself unless users say so!
4. Always create implementation plan in markdown format whenever it is possible. This plan should consist at least step-by-step and proposed code.
5. Summarize changes.
6. Wait for user testing

Never skip approval gates.

## Styling & Tailwind CSS Guidelines

- **Utility-First**: Always implement standard Tailwind CSS utility classes first before considering custom CSS or arbitrary values.
- **No Inline Styles**: Never use inline `style` props or `CSSProperties` objects unless strictly required for dynamic runtime values.
- **Theme & Design Tokens**: Use Tailwind / Flowbite theme color and spacing tokens (e.g., `text-heading`, `text-body`, `bg-neutral-primary-soft`, `border-default`).
- **Responsive & Interactive States**: Use Tailwind prefixes (`sm:`, `md:`, `hover:`, `focus:`) instead of custom media queries or JS state workarounds.
- **Icon Consistency**: Always use installed icon packages (`lucide-react`) instead of inline SVGs.