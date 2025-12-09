# Software Bill of Materials (SBOM)

**Project**: Nebula Chat  
**Version**: 0.1.7  
**Date**: 2025-01-27  
**Purpose**: Security audit and dependency tracking

## Production Dependencies

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| @google/genai | ^1.30.0 | Apache-2.0 | Google Gemini AI SDK |
| @radix-ui/react-dialog | ^1.1.15 | MIT | Accessible dialog component |
| @radix-ui/react-label | ^2.1.8 | MIT | Accessible label component |
| @radix-ui/react-tabs | ^1.1.13 | MIT | Accessible tabs component |
| @radix-ui/react-tooltip | ^1.2.8 | MIT | Accessible tooltip component |
| @types/react-syntax-highlighter | ^15.5.13 | MIT | TypeScript types for syntax highlighter |
| class-variance-authority | ^0.7.1 | MIT | Component variant management |
| clsx | ^2.1.1 | MIT | Conditional class names |
| framer-motion | ^12.23.24 | MIT | Animation library for React |
| ioredis | ^5.8.2 | MIT | Redis client for Node.js |
| lucide-react | ^0.555.0 | ISC | Icon library |
| mermaid | ^11.12.1 | MIT | Diagram generation library |
| next | 16.0.7 | MIT | React framework (patched for CVE-2025-66478) |
| next-themes | ^0.4.6 | MIT | Theme management for Next.js |
| react | 19.2.0 | MIT | UI library |
| react-dom | 19.2.0 | MIT | React DOM renderer |
| react-markdown | ^10.1.0 | MIT | Markdown rendering |
| react-resizable-panels | ^3.0.6 | MIT | Resizable panel layouts |
| react-syntax-highlighter | ^16.1.0 | MIT | Syntax highlighting for code blocks |
| sonner | ^2.0.7 | MIT | Toast notification library |
| tailwind-merge | ^3.4.0 | MIT | Tailwind class merging utility |

## Development Dependencies

| Package | Version | License | Purpose |
|---------|---------|---------|---------|
| @playwright/test | ^1.57.0 | Apache-2.0 | End-to-end testing |
| @tailwindcss/postcss | ^4 | MIT | Tailwind CSS PostCSS plugin |
| @types/node | ^20 | MIT | Node.js type definitions |
| @types/react | ^19 | MIT | React type definitions |
| @types/react-dom | ^19 | MIT | React DOM type definitions |
| eslint | ^9 | MIT | JavaScript linter |
| eslint-config-next | 16.0.7 | MIT | Next.js ESLint configuration |
| tailwindcss | ^4 | MIT | Utility-first CSS framework |
| typescript | ^5 | Apache-2.0 | TypeScript compiler |

## Security Notes

- All dependencies are actively maintained
- Google GenAI SDK is official Google package
- React 19.2.0 is latest stable version
- Next.js 16.0.5 is latest stable version
- Regular security audits recommended via `npm audit`

## Installation Date

All packages installed/reviewed: **2025-01-27**

## Notes

- **Redis Dependency**: `ioredis` is required for durable streaming features. Ensure Redis server is running or configure `REDIS_URL` environment variable.
- **Theme System**: `next-themes` provides seamless dark/light mode switching with SSR support.
- **Animation**: `framer-motion` powers all UI animations including Christmas theme transitions.
- **Diagram Support**: `mermaid` enables AI-generated diagram rendering with zoom/pan capabilities.

