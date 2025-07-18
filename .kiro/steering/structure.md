# Project Structure & Organization

## Root Directory Structure
```
flow-imob-crm-main/
├── src/                    # Source code
├── supabase/              # Database migrations and config
├── public/                # Static assets
├── node_modules/          # Dependencies
├── .kiro/                 # Kiro AI assistant configuration
└── [config files]         # Various configuration files
```

## Source Code Organization (`src/`)
```
src/
├── components/            # Reusable UI components
│   └── ui/               # shadcn/ui components
├── pages/                # Route components/pages
├── contexts/             # React contexts (AuthContext, etc.)
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── integrations/         # External service integrations (Supabase)
├── assets/               # Images, fonts, and other static assets
├── App.tsx               # Main application component
├── main.tsx              # Application entry point
├── index.css             # Global styles and Tailwind imports
└── vite-env.d.ts         # Vite type definitions
```

## Key Pages/Routes
- `/` - Dashboard (Index)
- `/auth` - Authentication page
- `/pipeline` - Sales pipeline management
- `/leads` - Lead management
- `/properties` - Property listings
- `/conexoes` - Business connections
- `/captacoes` - Property acquisitions
- `/documentacao-imovel` - Property documentation index
- `/documentacao-imovel/:id` - Specific property documentation

## Component Architecture
- **Layout Components**: AppSidebar, AppHeader, AppLayout
- **Protected Routes**: ProtectedRoute wrapper for authenticated pages
- **UI Components**: shadcn/ui based design system in `components/ui/`
- **Context Providers**: AuthProvider for authentication state

## Configuration Files
- `vite.config.ts` - Vite build configuration
- `tailwind.config.ts` - Tailwind CSS configuration with custom colors
- `components.json` - shadcn/ui configuration
- `tsconfig.json` - TypeScript configuration with path aliases
- `eslint.config.js` - ESLint rules and plugins
- `package.json` - Dependencies and scripts

## Naming Conventions
- **Files**: PascalCase for components (`AppSidebar.tsx`)
- **Directories**: lowercase with hyphens for multi-word (`documentacao-imovel`)
- **Routes**: kebab-case URLs (`/documentacao-imovel`)
- **Components**: PascalCase exports
- **Imports**: Use `@/` alias for src imports

## Database Integration
- Supabase configuration in `supabase/config.toml`
- Database migrations in `supabase/migrations/`
- Integration code in `src/integrations/`