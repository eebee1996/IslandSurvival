# Overview

This is a 3D island survival game built with React Three Fiber (R3F) and Express. Players explore a procedurally-generated island environment, gather resources, craft tools and weapons, hunt wildlife, manage survival stats (health, hunger, thirst), and face dynamic weather conditions. The game features first-person controls with pointer lock, a crafting system, combat mechanics, day/night cycles, and persistent game saves.

The application uses a full-stack architecture with a React frontend rendering a 3D world via Three.js, connected to an Express backend with planned PostgreSQL database integration via Drizzle ORM.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework & Rendering**
- **React 18** with TypeScript for UI components and game logic
- **React Three Fiber (@react-three/fiber)** - React renderer for Three.js, manages the 3D scene graph
- **React Three Drei (@react-three/drei)** - Helper components for R3F (controls, loaders, utilities)
- **Vite** - Development server and build tool with HMR support

**Rationale**: R3F provides a declarative approach to Three.js, making 3D scene management more maintainable with React's component model. Vite offers fast refresh cycles essential for game development iteration.

**UI Component Library**
- **Radix UI** primitives for accessible, headless UI components
- **Tailwind CSS** for utility-first styling with custom theme extensions
- **shadcn/ui** component patterns (alert, button, card, dialog, etc.)

**Rationale**: Radix provides accessible primitives without imposing styling opinions. Tailwind enables rapid UI development with consistent design tokens. This combination allows quick iteration on game menus and HUD elements.

**State Management**
- **Zustand** for global game state (multiple stores):
  - `useInventory` - Item collection and management
  - `useSurvival` - Health, hunger, thirst tracking
  - `useCombat` - Weapon equipment and attack cooldowns
  - `useResources` - Resource collection state
  - `useTime` - Day/night cycle and time progression
  - `useWeather` - Weather system state
  - `useAudio` - Sound management and mute state
  - `useGame` - Overall game phase management
  - `usePlayer` - Player position and direction (for UI components)
  - `useStructures` - Placeable structures in the world
  - `useAchievements` - Achievement tracking and rewards

**Rationale**: Zustand provides a lightweight, hook-based state solution without React Context overhead. Multiple stores separate concerns and prevent unnecessary re-renders. The `subscribeWithSelector` middleware enables fine-grained reactivity. The `usePlayer` store specifically enables UI components to access player position/direction without using R3F hooks outside the Canvas.

**3D Scene Architecture**
- Component-based 3D scene composition
- Key game systems as React components:
  - `Island` - Terrain generation with height variation
  - `Player` - First-person controller with physics
  - `Resources` - Interactive resource nodes (trees, rocks, berries)
  - `Wildlife` - AI-driven animals with flee/wander behavior
  - `Combat` - Raycasting attack system
  - `Weather` - Particle-based rain/storm effects
  - `Environment` - Dynamic lighting based on time/weather

**Rationale**: Breaking the 3D world into React components provides clear separation of systems, easier testing, and better code organization. Each system can manage its own state and lifecycle.

**Input Handling**
- **KeyboardControls** from Drei for game input mapping
- **PointerLockControls** for first-person camera control
- Custom hook `usePointerLock` for lock state management

**Rationale**: Pointer lock provides immersive FPS controls. Keyboard controls are mapped through Drei's system for easy configuration and state access.

**Game Persistence**
- LocalStorage-based save/load system (`saveLoad.ts`)
- Auto-save functionality with configurable intervals
- Serialization of all game state stores

**Rationale**: LocalStorage provides simple client-side persistence without backend complexity. The modular state architecture makes serialization straightforward.

## Backend Architecture

**Server Framework**
- **Express** with TypeScript for REST API endpoints
- Vite middleware integration for development HMR
- Static file serving for production builds

**Rationale**: Express provides a minimal, flexible foundation. Vite middleware integration enables seamless development experience with single-server setup.

**API Structure**
- Routes defined in `server/routes.ts`
- Storage abstraction layer (`IStorage` interface)
- Current implementation: `MemStorage` (in-memory)
- Designed for future database integration

**Rationale**: The storage interface abstracts data persistence, allowing easy swapping between in-memory and database implementations without changing business logic. This supports rapid prototyping (in-memory) while planning for production (database).

**Development vs Production**
- Development: Vite dev server with middleware mode
- Production: Pre-built static assets served by Express
- Environment-specific configuration via `NODE_ENV`

**Rationale**: Middleware mode in development provides instant HMR feedback. Production build serves optimized static files, reducing server complexity and improving performance.

## External Dependencies

**Database**
- **Drizzle ORM** - Type-safe SQL query builder
- **@neondatabase/serverless** - PostgreSQL serverless driver
- **Configuration**: PostgreSQL dialect, schema in `shared/schema.ts`
- Currently unused (in-memory storage active), but infrastructure prepared

**Rationale**: Drizzle provides excellent TypeScript integration and migration tooling. Neon's serverless driver suits modern deployment platforms. The shared schema approach allows type sharing between client and server.

**3D Graphics**
- **Three.js** - WebGL 3D library (via R3F)
- **@react-three/postprocessing** - Post-processing effects
- **vite-plugin-glsl** - GLSL shader support

**Audio**
- Native Web Audio API via `HTMLAudioElement`
- Audio files: background music, hit sounds, success sounds
- Client-side audio management store

**UI & Styling**
- **@fontsource/inter** - Web font
- **class-variance-authority** - Component variant management
- **clsx** & **tailwind-merge** - Conditional class utilities

**Build Tools**
- **TypeScript** - Type safety across entire stack
- **esbuild** - Fast server-side bundling
- **tsx** - TypeScript execution for development
- **PostCSS** with Autoprefixer for CSS processing

**Utilities**
- **date-fns** - Date manipulation
- **nanoid** - Unique ID generation
- **zod** - Schema validation (with Drizzle)
- **react-hook-form** - Form state management (UI components)
- **@tanstack/react-query** - Server state management (prepared but minimal usage)

**Development**
- **@replit/vite-plugin-runtime-error-modal** - Enhanced error reporting