# Motia Framework Tutorials - Presentation Guide

## 🎯 Presentation Overview

**Duration:** 45-60 minutes  
**Audience:** Developers interested in modern backend frameworks, event-driven architecture, and AI agent systems  
**Goal:** Demonstrate Motia's capabilities through three progressive examples

---

## 📋 Presentation Structure

### Part 1: Introduction (5 minutes)
### Part 2: REST API Tutorial (15 minutes)
### Part 3: Event-Driven Workflow (15 minutes)
### Part 4: AI Agent System (15 minutes)
### Part 5: Q&A and Next Steps (10 minutes)

---

## Part 1: Introduction to Motia (5 minutes)

### What is Motia?

**Elevator Pitch:**
> "Motia is a modern, code-first backend framework that unifies APIs, background jobs, workflows, and AI agents into a single cohesive system with built-in observability."

### Key Value Propositions

1. **🎯 Code-First Architecture**
   - Define everything in TypeScript/JavaScript/Python
   - No YAML configuration files
   - Full IDE autocomplete and type safety

2. **🔄 Event-Driven by Default**
   - Built-in event system
   - Asynchronous processing
   - Loosely coupled components

3. **👁️ Built-in Observability**
   - Visual Workbench UI
   - Real-time logs and tracing
   - State management visibility

4. **🚀 Developer Experience**
   - Hot-reload during development
   - Auto-generated types
   - Interactive API testing

### Why These Three Tutorials?

```
Tutorial 1: REST API          → Learn the basics
Tutorial 2: Event-Driven      → Add async workflows
Tutorial 3: AI Agents         → Build intelligent systems
```

**Progressive Learning Path:**
- Start simple (CRUD API)
- Add complexity (events)
- Build advanced systems (AI orchestration)

---

## Part 2: Task Management REST API (15 minutes)

### Introduction (2 minutes)

**What We'll Build:**
A complete REST API with CRUD operations for task management

**Key Learning Outcomes:**
- Understand API Steps in Motia
- Learn request/response validation with Zod
- Use the Motia Workbench for testing

### Demo Flow (10 minutes)

#### Step 1: Show Project Structure (1 min)
```
my-app/
└── src/
    └── tasks/
        ├── task-store.ts          # Data layer
        ├── create-task.step.ts    # POST /tasks
        ├── get-tasks.step.ts      # GET /tasks
        ├── get-task-by-id.step.ts # GET /tasks/:id
        ├── update-task.step.ts    # PUT /tasks/:id
        └── delete-task.step.ts    # DELETE /tasks/:id
```

**Talking Points:**
- Each file = one endpoint
- Self-contained with config + handler
- Type-safe with Zod schemas

#### Step 2: Explain API Step Pattern (2 min)

**Show create-task.step.ts:**
```typescript
export const config: ApiRouteConfig = {
  type: 'api',              // Marks as REST endpoint
  name: 'CreateTask',       // Unique identifier
  method: 'POST',           // HTTP method
  path: '/tasks',           // URL path
  bodySchema: z.object({    // Request validation
    title: z.string(),
    description: z.string(),
    status: z.enum(['pending', 'in-progress', 'completed'])
  }),
  responseSchema: {         // Response validation
    201: z.object({ ... })
  }
}
```

**Key Points:**
- Config defines the contract
- Handler implements the logic
- Zod provides runtime validation

#### Step 3: Live Demo - Create & List Tasks (3 min)

**Terminal 1 - Start Server:**
```bash
cd my-app
npm run dev
# Show: Server starts, endpoints register
```

**Terminal 2 - Test API:**
```bash
# Create a task
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn Motia",
    "description": "Complete all tutorials",
    "status": "in-progress"
  }' | jq .

# List all tasks
curl http://localhost:3000/tasks | jq .
```

**Show Results:**
- Task created with ID
- Timestamps added automatically
- List returns array of tasks

#### Step 4: Workbench Demo (4 min)

**Open Browser:** http://localhost:3000

**Show Features:**
1. **Flow Diagram**
   - Select "task-management" flow
   - Visual representation of all endpoints
   - Click nodes to see details

2. **Endpoints Tab**
   - All 5 endpoints listed
   - Click "POST /tasks"
   - Show interactive form
   - Test creating a task
   - View response

3. **Logs Tab**
   - Real-time log streaming
   - Filter by endpoint
   - See request/response

4. **States Tab**
   - Currently empty (in-memory store)
   - Would show data if using state plugin

**Key Takeaway:**
> "Workbench gives you production-grade observability out of the box"

### Key Concepts Summary (1 min)

✅ **API Steps** - Self-contained endpoint definitions  
✅ **Zod Validation** - Runtime type safety  
✅ **Workbench** - Visual development and testing  
✅ **Hot Reload** - Instant feedback during development  

---

## Part 3: Event-Driven User Registration (15 minutes)

### Introduction (2 minutes)

**What We'll Build:**
A user registration system where one action triggers multiple async workflows

**Key Learning Outcomes:**
- Understand Event-Driven Architecture
- Learn how events decouple systems
- See parallel processing in action

**The Problem:**
Traditional approach - everything synchronous:
```typescript
async function registerUser(data) {
  const user = await createUser(data)
  await sendWelcomeEmail(user)      // Blocks
  await setupAccount(user)           // Blocks
  await logNotification(user)        // Blocks
  return user
}
// User waits for EVERYTHING to complete
```

**Motia's Solution - Event-driven:**
```typescript
// API responds immediately
await emit({ topic: 'user.registered', data: user })

// These run asynchronously in parallel
- SendWelcomeEmail subscribes to 'user.registered'
- SetupUserAccount subscribes to 'user.registered'
- LogNotification subscribes to 'email.sent'
```

### Demo Flow (10 minutes)

#### Step 1: Show Event Flow Diagram (2 min)

**Draw on whiteboard or show:**
```
┌─────────────────────────┐
│  POST /users/register   │  ← User makes request
│   (API Step)            │
└───────────┬─────────────┘
            │ emits: user.registered
            ├─────────────┬──────────────┐
            ▼             ▼              ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │  Email   │  │ Account  │  │  Other   │  ← Run in parallel
    │  Agent   │  │  Setup   │  │  Tasks   │
    └────┬─────┘  └──────────┘  └──────────┘
         │ emits: email.sent
         ▼
    ┌──────────┐
    │  Logger  │  ← Secondary event chain
    └──────────┘
```

**Key Points:**
- API responds immediately (202 Accepted)
- Events trigger async handlers
- Multiple handlers can subscribe to same event
- Events can trigger other events (chaining)

#### Step 2: Code Walkthrough (3 min)

**Show register-user.step.ts (API):**
```typescript
export const config: ApiRouteConfig = {
  type: 'api',
  emits: ['user.registered'],  // ← Declares what events it emits
  // ...
}

export const handler = async (req, { emit, state }) => {
  const userId = crypto.randomUUID()
  
  // Store user
  await state.set('users', userId, { ...req.body, userId })
  
  // Emit event (non-blocking!)
  await emit({
    topic: 'user.registered',
    data: { userId, name: req.body.name, email: req.body.email }
  })
  
  // Return immediately
  return { status: 202, body: { userId, status: 'processing' } }
}
```

**Show send-welcome-email.step.ts (Event Handler):**
```typescript
export const config: EventConfig = {
  type: 'event',                    // ← Event handler, not API
  subscribes: ['user.registered'],  // ← Listens for this event
  emits: ['email.sent'],            // ← Can emit new events
  // ...
}

export const handler = async (input, { emit, logger }) => {
  // input = event data { userId, name, email }
  logger.info('Sending welcome email', { email: input.email })
  
  // Simulate email sending
  await sendEmail(input.email, 'Welcome!')
  
  // Emit completion event
  await emit({
    topic: 'email.sent',
    data: { userId: input.userId, type: 'welcome' }
  })
}
```

**Key Differences:**
| API Step | Event Step |
|----------|------------|
| Triggered by HTTP request | Triggered by events |
| Returns HTTP response | No return value |
| `req` parameter | `input` parameter (event data) |

#### Step 3: Live Demo (4 min)

**Terminal 1 - Start Server:**
```bash
cd event-driven-workflow
npm run dev
```

**Terminal 2 - Register User:**
```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith",
    "email": "alice@example.com",
    "password": "securepass123"
  }' | jq .
```

**Show Immediate Response:**
```json
{
  "userId": "user-1234567890",
  "name": "Alice Smith",
  "email": "alice@example.com",
  "status": "pending"
}
```

**Point to Logs (Terminal 1):**
```
[INFO] RegisterUser - User registered
[INFO] SendWelcomeEmail - Sending welcome email
[INFO] SetupUserAccount - Setting up account
[INFO] SendWelcomeEmail - Email sent
[INFO] LogNotification - Notification logged
[INFO] SetupUserAccount - Account setup complete
```

**Wait 2-3 seconds, then check status:**
```bash
curl http://localhost:3000/users/user-1234567890/status | jq .
```

**Show Completed Status:**
```json
{
  "userId": "user-1234567890",
  "status": "active",
  "emailSent": true,
  "accountSetup": true
}
```

#### Step 4: Workbench Visualization (1 min)

**Open:** http://localhost:3000

**Show:**
- Flow diagram with event chains
- Click on "SendWelcomeEmail" → See it subscribes to `user.registered`
- Logs showing parallel execution
- States showing user data at each stage

### Key Concepts Summary (1 min)

✅ **Event-Driven** - Decouple components with events  
✅ **Async Processing** - Don't block user requests  
✅ **Parallel Execution** - Multiple handlers run simultaneously  
✅ **Event Chains** - Events can trigger other events  
✅ **State Management** - Track workflow progress  

---

## Part 4: AI Research Agent System (15 minutes)

### Introduction (3 minutes)

**What We'll Build:**
A multi-agent AI system where specialized agents collaborate to conduct research

**Key Learning Outcomes:**
- Orchestrate multiple AI agents
- Handle API rate limits gracefully
- Build sequential AI workflows
- Integrate external AI services (Google Gemini)

**The Challenge:**
> "How do you build a system where multiple AI agents work together to accomplish complex tasks?"

**Real-World Use Cases:**
- Research assistants
- Content generation pipelines
- Data analysis workflows
- Decision support systems
- Automated document processing

### Architecture Deep Dive (4 minutes)

#### The Agent Pipeline

**Show Diagram:**
```
POST /research → 🤖 Planning Agent  → Creates 5 research topics
                        ↓
                 🤖 Research Agent → Researches each topic (5 API calls)
                        ↓
                 🤖 Analysis Agent → Identifies patterns & insights
                        ↓
                 🤖 Synthesis Agent → Generates final report
                        ↓
                 📝 Report Logger   → Logs completion
                        ↓
GET /status    → Retrieve complete report
```

**Key Design Decisions:**

1. **Sequential Processing** (not parallel)
   - Each agent builds on previous results
   - Planning → Research → Analysis → Synthesis
   - Clear data flow

2. **State Management**
   - All intermediate results stored in Redis
   - Can inspect at any stage
   - Enables debugging and recovery

3. **Retry Logic**
   - Exponential backoff for rate limits
   - Extracts retry delay from API errors
   - Up to 5 automatic retries

4. **Rate Limiting Strategy**
   - 2-second delay between API calls
   - Respects free-tier quotas (5 requests/minute)
   - Prevents 429 errors

#### Code Architecture (3 min)

**Show Project Structure:**
```
ai/
├── src/
│   ├── research/
│   │   ├── research-api.step.ts       # Triggers workflow
│   │   ├── planning-agent.step.ts     # Agent 1
│   │   ├── research-agent.step.ts     # Agent 2
│   │   ├── analysis-agent.step.ts     # Agent 3
│   │   ├── synthesis-agent.step.ts    # Agent 4
│   │   ├── report-logger.step.ts      # Final handler
│   │   └── status-api.step.ts         # Check progress
│   └── utils/
│       └── retry-helper.ts            # Rate limit handling
```

**Show retry-helper.ts pattern:**
```typescript
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  // Detects rate limit errors (429)
  // Extracts retry delay from error message
  // Implements exponential backoff
  // Waits and retries automatically
}
```

**Show agent pattern (planning-agent.step.ts):**
```typescript
export const config = {
  type: 'event',
  subscribes: ['research.started'],  // Triggered by API
  emits: ['plan.completed'],         // Triggers next agent
}

export const handler = async (input, { emit, state, logger }) => {
  // 1. Get Gemini model
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  
  // 2. Create prompt
  const prompt = `Create a research plan for: "${input.query}"`
  
  // 3. Call with retry logic
  const result = await retryWithBackoff(
    async () => await model.generateContent(prompt),
    { maxRetries: 5, initialDelay: 2000 }
  )
  
  // 4. Parse JSON response
  const plan = JSON.parse(result.response.text())
  
  // 5. Store in state
  await state.set('research', input.researchId, { plan })
  
  // 6. Emit event for next agent
  await emit({ topic: 'plan.completed', data: { ...input, plan } })
}
```

### Live Demo (6 minutes)

#### Step 1: Setup & Start (1 min)

**Show .env file:**
```bash
GOOGLE_API_KEY=AIzaSyDJbExqTJMSkrZJi5u4HVV0i1eKOQTT0kg
```

**Start server:**
```bash
cd ai
npm run dev
```

**Show registration:**
```
✓ ResearchAPI registered
✓ PlanningAgent registered
✓ ResearchAgent registered
✓ AnalysisAgent registered
✓ SynthesisAgent registered
✓ ReportLogger registered
✓ ResearchStatusAPI registered
```

#### Step 2: Start Research (2 min)

**Terminal 2 - Submit query:**
```bash
curl -X POST http://localhost:3000/research \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the benefits and challenges of microservices architecture?",
    "depth": "standard"
  }' | jq .
```

**Show immediate response:**
```json
{
  "researchId": "research-1738339200000",
  "query": "What are the benefits and challenges of microservices?",
  "status": "pending",
  "progress": {
    "planning": "pending",
    "research": "pending",
    "analysis": "pending",
    "synthesis": "pending"
  }
}
```

**Copy researchId for next step**

#### Step 3: Watch Real-Time Progress (2 min)

**Point to Terminal 1 - Live Logs:**
```
[INFO] ResearchAPI - Starting research workflow
[INFO] PlanningAgent - Creating research plan
[INFO] PlanningAgent - Plan created (5 topics)
[INFO] PlanningAgent - Plan emitted for research

[INFO] ResearchAgent - Starting research (5 topics)
[INFO] ResearchAgent - Researching: Benefits of Microservices
[INFO] ResearchAgent - Researching: Challenges of Microservices
[INFO] ResearchAgent - Researching: Deployment Strategies
[INFO] ResearchAgent - Researching: Service Communication
[INFO] ResearchAgent - Researching: Data Management
[INFO] ResearchAgent - Research completed (5 findings)

[INFO] AnalysisAgent - Analyzing findings
[INFO] AnalysisAgent - Analysis completed (3 insights)

[INFO] SynthesisAgent - Synthesizing report
[INFO] SynthesisAgent - Report generated
[INFO] ReportLogger - Research workflow completed!
```

**Explain what's happening:**
- Planning agent creates 5 research topics
- Research agent calls Gemini 5 times (with delays)
- Analysis agent aggregates findings
- Synthesis agent generates final report
- Entire process: 30-60 seconds

#### Step 4: Retrieve Final Report (1 min)

**Check status:**
```bash
curl http://localhost:3000/research/research-1738339200000/status | jq .
```

**Show completed report:**
```json
{
  "researchId": "research-1738339200000",
  "status": "completed",
  "progress": {
    "planning": "completed",
    "research": "completed",
    "analysis": "completed",
    "synthesis": "completed"
  },
  "report": {
    "title": "Research Report: Microservices Architecture",
    "executive_summary": "...",
    "key_takeaways": [
      "Microservices enable independent scaling and deployment",
      "Distributed systems complexity requires robust monitoring",
      "Service communication patterns are critical for performance"
    ],
    "conclusions": "...",
    "confidence_level": "high"
  }
}
```

### Advanced Features Demo (2 minutes)

#### Rate Limit Handling

**Explain the scenario:**
> "Google Gemini free tier: 5 requests per minute. We make 7 API calls total (1 plan + 5 research + 1 analysis). Without retry logic, this fails."

**Show retry-helper.ts in action:**
```typescript
// If 429 error occurs:
// 1. Extracts: "Please retry in 23.948s"
// 2. Waits exactly 23.948 seconds
// 3. Retries automatically
// 4. Success!
```

**Show in logs (if rate limit hit):**
```
[WARN] RetryHelper - Attempt 1/5 failed. Retrying in 24000ms...
[INFO] ResearchAgent - Researching: Data Management
```

#### State Inspection in Workbench

**Open:** http://localhost:3000

**Show:**
1. **Flow Diagram** - Visual agent pipeline
2. **States Tab:**
   - Search for researchId
   - Expand to see:
     - Plan with 5 topics
     - Findings array (5 items)
     - Analysis object
     - Final report
3. **Logs Tab** - Filter by "ResearchAgent"
4. **Tracing Tab** - See complete execution timeline

### Key Concepts Summary (1 min)

✅ **Multi-Agent Orchestration** - Sequential AI workflows  
✅ **Retry Logic** - Handle rate limits gracefully  
✅ **State Management** - Track complex workflows  
✅ **AI Integration** - External service integration patterns  
✅ **Production-Ready** - Error handling, logging, observability  

---

## Part 5: Q&A and Next Steps (10 minutes)

### Common Questions (5 minutes)

#### Q: How does Motia compare to Express.js?

**Answer:**
- Express = HTTP framework only
- Motia = Full backend framework (APIs + events + jobs + AI)
- Motia includes: event system, state management, observability, workbench
- Express: Add these yourself (Socket.io, Bull, Winston, etc.)

#### Q: Can I use Motia with existing databases?

**Answer:**
Yes! Motia is database-agnostic:
```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const handler = async (req) => {
  const user = await prisma.user.create({ data: req.body })
  return { status: 201, body: user }
}
```

#### Q: Is Motia production-ready?

**Answer:**
- Currently in beta (v0.17.x)
- Used in production by early adopters
- Active development and community
- Enterprise features coming in v1.0

#### Q: How do I deploy Motia apps?

**Answer:**
```bash
npm run build   # Builds production bundle
npm start       # Starts production server
```
Deploy to: Docker, Kubernetes, Cloud Run, AWS, Azure, etc.

#### Q: What about Python support?

**Answer:**
- Motia supports Python steps
- Can mix TypeScript and Python in same project
- Great for ML/AI workloads
- Python agents can call TypeScript APIs via events

### Next Steps (5 minutes)

#### For Attendees

**Immediate Actions:**
1. Clone the repository:
   ```bash
   git clone https://github.com/darshan45672/Motia.git
   cd Motia
   ```

2. Try the tutorials in order:
   - Start with `my-app` (REST API)
   - Move to `event-driven-workflow`
   - Advanced: `ai` (AI agents)

3. Join the community:
   - GitHub: [motiadev/motia](https://github.com/motiadev/motia)
   - Documentation: [motia.dev/docs](https://motia.dev/docs)
   - Discord: [Community link]

**Learning Path:**
```
Week 1: REST APIs + Workbench
Week 2: Event-driven workflows
Week 3: Background jobs + Cron
Week 4: AI agent systems
```

#### Build Your Own Project Ideas

**Beginner:**
- Blog API with comments
- Todo app with notifications
- URL shortener with analytics

**Intermediate:**
- E-commerce order processing
- Content moderation pipeline
- Multi-tenant SaaS backend

**Advanced:**
- AI-powered customer support
- Real-time data processing pipeline
- Multi-agent research system (like we built!)

#### Resources

**Official Docs:**
- Quick Start: https://motia.dev/docs/getting-started/quick-start
- API Reference: https://motia.dev/docs/api-reference
- Examples Repo: https://github.com/motiadev/motia-examples

**Code from Today:**
- GitHub: https://github.com/darshan45672/Motia
- All 3 projects fully working
- README with step-by-step instructions

**Video Tutorials:**
- [Link to YouTube channel]
- [Link to course]

---

## 🎤 Presentation Tips

### Before You Start

- [ ] All 3 projects working locally
- [ ] Redis running
- [ ] Google Gemini API key configured
- [ ] Terminals pre-configured with commands
- [ ] Browser tabs open (Workbench for each project)
- [ ] Code editor with relevant files open

### During Presentation

**Do:**
- Show, don't just tell (live demos)
- Highlight logs in real-time
- Use Workbench to visualize
- Compare before/after (sync vs async)
- Emphasize developer experience

**Don't:**
- Type commands live (have them ready)
- Wait for AI agents (show pre-recorded if needed)
- Get stuck on errors (have backup plan)
- Skip the "why" (explain design decisions)

### Backup Plans

**If Live Demo Fails:**
1. Have screenshots ready
2. Pre-recorded video backup
3. Show code walkthrough instead
4. Use logs from previous run

**If Rate Limited:**
- Explain the error (it's a feature!)
- Show retry logic kicking in
- Use as teaching moment
- Switch to status endpoint

---

## 📊 Presentation Metrics

**What Success Looks Like:**

1. **Understanding (Test with questions)**
   - Can explain event-driven architecture
   - Understand API vs Event steps
   - See value of Workbench

2. **Engagement**
   - Questions during demo
   - Follow-up questions
   - Requests to see more

3. **Action**
   - Clone the repo
   - Try tutorials
   - Join community

---

## 🎯 Key Takeaways (Closing Slide)

### Motia Framework Enables:

✅ **Rapid Development** - Build faster with built-in patterns  
✅ **Event-Driven Architecture** - Scalable, decoupled systems  
✅ **AI-First** - Orchestrate multiple AI agents easily  
✅ **Developer Experience** - Hot reload, type safety, visual tools  
✅ **Production-Ready** - Observability, error handling, state management  

### Three Progressive Tutorials:

1. **REST API** → Master the basics
2. **Event-Driven** → Build async workflows  
3. **AI Agents** → Create intelligent systems

### Get Started Today:

```bash
git clone https://github.com/darshan45672/Motia.git
cd Motia/my-app
npm install
npm run dev
```

**Visit:** https://motia.dev | **Join:** [Discord/Community]

---

## 📝 Speaker Notes

### Opening Hook

> "Imagine building a backend where your REST API, background jobs, event handlers, and AI agents all work together seamlessly - with observability built-in. That's Motia. Today, I'll show you three real-world examples, from a simple REST API to a multi-agent AI research system."

### Transitions

**REST API → Events:**
> "Now that you've seen how easy it is to build APIs with Motia, let's add the power of events. What if registering a user could trigger multiple independent tasks without blocking the response?"

**Events → AI:**
> "We've seen how events enable async workflows. Now let's take it to the next level: orchestrating multiple AI agents to work together on complex tasks."

### Closing

> "Motia isn't just a framework - it's a new way of thinking about backend development. Start with simple APIs, grow into event-driven workflows, and scale to AI-powered systems - all with the same patterns and tools. The repository is on GitHub, all three projects are ready to run. Who wants to build something amazing with Motia?"

---

**Good luck with your presentation! 🚀**
