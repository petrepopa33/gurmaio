# Gurmaio - Budget-Aware Meal Planning Platform

A production-ready, cloud-native meal planning application that generates budget-aware, nutrition-accurate meal plans with explicit cost calculation at all levels.

## 📁 Repository Structure

```
gurmaio/
├── PRD.md                    # Product Requirements Document
├── ARCHITECTURE.md           # Technical Architecture & Design
├── IMPLEMENTATION.md         # Step-by-step Implementation Guide
├── README.md                 # This file
└── src/                      # React Prototype (Demo UI)
    ├── components/           # UI Components
    ├── types/                # TypeScript Type Definitions
    └── lib/                  # Utilities & Mock Data
```

## 🎯 Project Overview

Gurmaio is designed as a commercial-grade meal planning platform with these core principles:

### Architecture
- **Edge-First**: Cloudflare Workers (280+ global locations)
- **Stateless**: No server-side sessions, JWT authentication
- **Deterministic**: All calculations reproducible and auditable
- **Separation of Concerns**: AI generates structure, engines calculate values

### Key Features
1. **Budget-First Planning**: Every meal plan respects user budget with transparent cost breakdowns
2. **Precise Nutrition**: Deterministic calculations for calories, protein, carbs, and fats at all levels
3. **Smart Shopping**: Aggregated shopping lists accounting for real-world grocery constraints
4. **GDPR Compliant**: Hard delete on account deletion
5. **Mobile-First**: Flutter app for iOS and Android

## 📚 Documentation

### 1. [PRD.md](./PRD.md)
Complete product requirements including:
- User experience design
- Feature specifications
- Edge case handling
- Visual design system (colors, typography, animations)
- Component selection

### 2. [ARCHITECTURE.md](./ARCHITECTURE.md)
Technical architecture documentation including:
- Cloud architecture diagrams
- API contract specifications
- Data models and schemas
- Deterministic engine pseudocode (nutrition, cost, shopping list)
- AI integration strategy
- Security & performance considerations

### 3. [IMPLEMENTATION.md](./IMPLEMENTATION.md)
Step-by-step implementation guide covering:
- Database setup (Supabase)
- Cloudflare Workers configuration
- Engine implementation
- API route development
- Flutter client integration
- Testing & deployment

## 🚀 Quick Start (React Prototype)

This repository includes a working React prototype demonstrating the Gurmaio UI and user experience.

### Prerequisites
- Node.js 18+
- npm
- Supabase account (for data persistence)

### Installation

```bash
# Install dependencies
npm install

# Configure Supabase (see QUICKSTART.md for full setup)
cp .env.example .env
# Add your Supabase credentials to .env

# Start development server
npm run dev
```

### 🗄️ Database Setup (Supabase)

The app uses **Supabase** as the backend for persistent data storage.

#### Quick Start
1. **Setup Guide**: [supabase/SETUP.md](./supabase/SETUP.md) - Complete setup instructions (5 minutes)
2. **Apply Migration**: [supabase/migrations/20240101000000_initial_schema.sql](./supabase/migrations/20240101000000_initial_schema.sql)
3. **Verify**: [supabase/VERIFICATION_CHECKLIST.md](./supabase/VERIFICATION_CHECKLIST.md)

#### Documentation
- 📖 **Schema Overview**: [supabase/README.md](./supabase/README.md)
- 🎨 **Visual Diagrams**: [supabase/SCHEMA_DIAGRAM.md](./supabase/SCHEMA_DIAGRAM.md)
- 🔍 **Query Reference**: [supabase/QUERY_REFERENCE.md](./supabase/QUERY_REFERENCE.md)
- 📋 **Full Index**: [supabase/INDEX.md](./supabase/INDEX.md)

#### Core Tables (5)
1. **profiles** - User settings and meal preferences
2. **meal_plans** - Meal plans with budget and duration
3. **meals** - Individual meals with nutritional data
4. **shopping_items** - Shopping list items per meal plan
5. **user_progress** - Daily progress tracking

#### Features
- ✅ Row Level Security (RLS) on all tables
- ✅ Automatic timestamps with triggers
- ✅ Cascading deletes for data integrity
- ✅ Optimized indexes for performance
- ✅ JSONB fields for flexible data storage
- ✅ Data validation with CHECK constraints

See [supabase/INDEX.md](./supabase/INDEX.md) for complete documentation.

### Features Demonstrated
- ✅ User onboarding flow
- ✅ Budget and dietary preference configuration
- ✅ Meal plan generation (with AI)
- ✅ Multi-day meal plan visualization
- ✅ Nutrition and cost breakdowns at all levels
- ✅ Shopping list aggregation
- ✅ Calendar scheduling and progress tracking
- ✅ Meal prep planning
- ✅ Badges and achievements
- ✅ Responsive design (mobile & desktop)
- ✅ Multi-language support (10 languages)
- ✅ Data persistence with Supabase

## 🏗️ Production Implementation

### Technology Stack

#### Backend
- **Cloudflare Workers** - Serverless compute (Node.js runtime)
- **Supabase** - PostgreSQL database + authentication
- **OpenAI/Anthropic** - AI meal composition generation

#### Frontend
- **Flutter** - Cross-platform mobile app (iOS + Android)
- **Supabase Flutter SDK** - Authentication & API client

#### Infrastructure
- **Cloudflare** - Edge network, CDN, DDoS protection
- **Supabase** - Managed Postgres with connection pooling
- **GitHub Actions** - CI/CD pipeline

### Architecture Components

```
┌─────────────┐
│ Flutter App │
│ (iOS/Android)│
└──────┬──────┘
       │ JWT Auth
       ▼
┌─────────────────┐
│ Cloudflare      │
│ Workers API     │◄────┐
└────────┬────────┘     │
         │              │
    ┌────▼────┐   ┌─────┴─────┐
    │Supabase │   │  AI API   │
    │Postgres │   │(OpenAI)   │
    └─────────┘   └───────────┘
```

### Deployment Pipeline

1. **Database**: Supabase migrations applied
2. **API**: `wrangler deploy` to Cloudflare Workers
3. **Mobile**: Flutter build → App Store + Play Store

## 🔑 Key Design Decisions

### Why Cloudflare Workers?
- Sub-200ms global latency
- Auto-scaling to millions of requests
- No cold starts
- Cost-effective ($5/month for 10M requests)

### Why Separate AI from Calculations?
- **Reproducibility**: Same inputs = same outputs
- **Auditability**: Every cost/nutrition value traceable
- **Trust**: Users can verify calculations
- **Testability**: Deterministic engines easy to unit test

### Why Flutter?
- Single codebase for iOS + Android
- Native performance
- Rich UI component library
- Strong typing with Dart

## 📊 Data Flow

### Meal Plan Generation

```
User → Profile Config → API
                        ↓
                  AI Generates Structure
                    (JSON meals)
                        ↓
                Nutrition Engine
            (Calculate per ingredient)
                        ↓
                   Cost Engine
            (Calculate per ingredient)
                        ↓
              Aggregate to Meal Level
                        ↓
              Aggregate to Day Level
                        ↓
              Aggregate to Plan Level
                        ↓
              Validate Against Budget
                        ↓
            ┌───────────┴───────────┐
            │                       │
        Over Budget?           Within Budget
            │                       │
    Retry with                 Save to DB
    Tighter Constraints            │
            │                       │
            └───────────┬───────────┘
                        ↓
                Return to Client
```

## 🧪 Testing Strategy

### Unit Tests
- Nutrition engine calculations
- Cost engine calculations
- Budget validation logic
- Shopping list aggregation

### Integration Tests
- API endpoint responses
- Database queries
- RLS policies

### End-to-End Tests
- Complete user flows
- Multi-day generation
- Budget enforcement scenarios

## 🔐 Security

- JWT authentication via Supabase
- Row-Level Security (RLS) for all user data
- Service role key never exposed to client
- Input validation with Zod schemas
- Rate limiting via Cloudflare
- CORS whitelist

## 📈 Performance Targets

- **API Response Time**: < 200ms (p95)
- **AI Generation Time**: < 10s for 7-day plan
- **Shopping List**: < 100ms
- **Database Queries**: < 50ms per query
- **Global Edge Latency**: < 50ms

## 🌍 Compliance

- **GDPR**: Hard delete on account deletion
- **App Store**: Follows Apple Human Interface Guidelines
- **Play Store**: Follows Material Design principles
- **Accessibility**: WCAG AA contrast ratios
- **Privacy Policy**: Publicly accessible at `/privacy`
- **Terms of Service**: Publicly accessible at `/terms`

### Legal Document URLs for App Store Submission

Both iOS App Store and Google Play Store require public URLs for legal documents:

- **Privacy Policy**: `https://your-domain.com/privacy`
- **Terms of Service**: `https://your-domain.com/terms`

These pages are:
- ✅ Publicly accessible (no authentication required)
- ✅ Mobile-responsive
- ✅ Include all required compliance information
- ✅ GDPR Article 17 compliant (Right to Erasure)
- ✅ COPPA compliant (13+ age restriction)
- ✅ Medical and AI disclaimers

See [LEGAL_COMPLIANCE.md](./LEGAL_COMPLIANCE.md) for complete app store compliance details.

## 📱 Mobile App Features

- [ ] Biometric authentication
- [ ] Offline mode (cached meal plans)
- [ ] Push notifications (meal reminders)
- [ ] Dark mode
- [ ] Multi-language support
- [ ] In-app purchases (premium features)
- [ ] Social sharing
- [ ] Barcode scanner (shopping list)

## 🚧 Roadmap

### Phase 1: MVP (Current)
- ✅ Core meal plan generation
- ✅ Budget enforcement
- ✅ Shopping list generation
- ✅ User authentication

### Phase 2: Enhanced Features
- [ ] Meal plan history
- [ ] Ingredient substitutions
- [ ] Recipe details & instructions
- [ ] Favorites & custom meals

### Phase 3: Social & Integration
- [ ] Share meal plans with friends
- [ ] Grocery delivery API integration
- [ ] Fitness app integration
- [ ] Nutritionist review system

### Phase 4: Intelligence
- [ ] ML-based preference learning
- [ ] Seasonal ingredient suggestions
- [ ] Local grocery price updates
- [ ] Personalized recommendations

## 💰 Business Model

### Freemium
- **Free Tier**: 1 meal plan per week
- **Premium**: $9.99/month
  - Unlimited meal plans
  - Advanced filters (low-sodium, keto, etc.)
  - Recipe instructions
  - Grocery delivery integration
  - Priority support

### B2B
- Corporate wellness programs
- Fitness center partnerships
- Healthcare provider integrations

## 🤝 Contributing

This is a design and architecture reference. For production implementation:

1. Review all documentation files
2. Set up development environment per IMPLEMENTATION.md
3. Follow coding standards in architecture docs
4. Write tests for all new features
5. Deploy to staging before production

## 📄 License

MIT License - See LICENSE file for details

## 📞 Contact & Support

For questions about this architecture:
- Review the documentation files first
- Check implementation guide for setup issues
- Consult architecture doc for design decisions

---

**Built with precision. Designed for scale. Ready for production.**
