# Technology Stack & Build System

## Core Technologies
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5.4+ with SWC plugin for fast compilation
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui with Radix UI primitives
- **Backend**: Supabase (PostgreSQL database + Auth + Real-time)
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: React Router DOM v6
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

## Key Libraries
- **Drag & Drop**: @dnd-kit for pipeline management
- **Charts**: Recharts for data visualization
- **Date Handling**: date-fns
- **Theming**: next-themes for dark/light mode
- **Notifications**: Sonner for toast notifications
- **Flow Diagrams**: @xyflow/react for visual workflows

## Development Tools
- **Linting**: ESLint with TypeScript support
- **Package Manager**: npm (with bun.lockb present, suggesting Bun compatibility)
- **TypeScript**: Strict configuration with path aliases (@/* → ./src/*)

## Build Commands
```bash
# Development server
npm run dev

# Production build
npm run build

# Development build (with dev mode flags)
npm run build:dev

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Configuration Notes
- **Port**: Development server runs on port 8080
- **Path Aliases**: `@/*` maps to `src/*` for clean imports
- **TypeScript**: Relaxed settings (noImplicitAny: false, strictNullChecks: false)
- **Tailwind**: Custom color system with CRM-specific lead status colors
- **Component Tagger**: Lovable development integration enabled in dev mode