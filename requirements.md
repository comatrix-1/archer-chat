---
name: "Archer Chat"
about: "Real-time chat application between jobseekers and recruiters through the recruitment process"
date_created: "2025-04-05"
project_name: "ArcherChat"
tech_stack: ["Vite", "React Router v7", "TypeScript", "Shadcn", "Tailwind CSS", "Chart.js", "date-fns"]
version: "1.3"
---

# 🎯 Archer Chat PRD

A real-time chat application between jobseekers and recruiters through the recruitment process.

---

## 1. **Success Criteria**

1. **Core Functionality**
   - [ ] **Profile**: Users can set up their profile details that contains details one would put in a resume.
   - [ ] **Chat message input**: A message box where user can type a message and send.
   - [ ] **Recruitment status**: A badge tagged to each chat on the recruitment status/ stage.
   - [ ] **Group chat**: Each chat can contain multiple members, including jobseekers and recruiters.
   - [ ] **Scheduling**: Both jobseekers and recruiters can schedule events e.g. interviews.
   - [ ] **Mobile-Responsive**: Layout should adjust for smaller screens without major issues.

2. **Validation Checklist**
   - [ ] **Build & Run**: Fresh `npm install && npm run dev` works without errors.
   - [ ] **Recruitment stage**: Recruiter can update the recruitment status (Pending is the default)
   - [ ] **Message sending**: Entering a message in message box and pressing 'Enter' sends a message that can be received in real-time by other members of the chat.
   - [ ] **Message format**: Messages sent by the logged in user should be shown on the right, and messages sent by others should be shown on  the left. Timestamps should be shown on all messages.
   - [ ] **Chart Page**: A separate page or section for a jobseeker/ recruiter to visualize stats (e.g., line chart + pie chart).
   - [ ] **Data Persistence**: Entries remain available if the user navigates away and comes back later.

---

## 2. **Tech Stack**

- **Vite** for SPA
- **React Router v7** for routing
- **TypeScript** for type safety
- **Shadcn** UI components (dialogs, buttons, forms)
- **Tailwind CSS** for styling
- **Chart.js** for data visualization
- **date-fns** for date operations
- **localforage** (or equivalent) for local data storage
- **@emoji-mart/react** for an emoji picker
- **PostgresQL** for database
- **cal.com** for calendar scheduling

### **Why These Choices?**
- **Vite + React Router**: Great for client-side routing and type safety
- **Shadcn + Tailwind**: Rapid UI development with consistent design
- **Chart.js**: Straightforward library for rendering charts
- **date-fns**: Lightweight date utilities
- **PostgresQL**: Realtime and can handle chat history effectively
- **cal.com**: allows for widgets, open-source

---

## 3. **Architecture**
- Frontend: React Router
- Backend: API Routes or tRPC
- Realtime: WebSockets or Pusher/Ably/Supabase Realtime
- Persistence: PostgreSQL (Prisma ORM)

## UX Considerations
- Show "sending..." indicator while awaiting message confirmation
- Auto-scroll to latest message
- Display error if message fails (e.g. alert)

---

## 4. Realtime Messaging
- **Primary Option**: Supabase Realtime


---

## 5. **User Stories**

### 🔐 Authentication

1. **Login**
   - **As a user**, I want to quickly login to the application to use its features.
     - **Given** I am unauthenticated  
     - **When** I login with my email and password on the login page  
     - **Then** I am authenticated and can see the respective home page (chat) for my role (jobseeker/recruiter)

2. **Register**
   - **As a user**, I want to register to the application to start using its features.
     - **Given** I am unauthenticated  
     - **When** I register with my email and password  
     - **Then** I am authenticated and redirected to my role-specific dashboard  

---

### 💬 Chat & Messaging

3. **Chat window**
   - **As a user**, I want to view chat history so I can stay informed of past conversations.
     - **Given** I am authenticated and on any page  
     - **When** I click on a chat list item  
     - **Then** I see the full message history  

4. **Send & receive messages**
   - **As a user**, I want to send and receive real-time messages to stay updated.
     - **Given** I am in a chat window  
     - **When** I type and press Enter  
     - **Then** the message is sent and shown in real-time to all members  

5. **Message status**
   - **As a user**, I want to see if my message is sending or failed so I can retry if needed.
     - **Given** I’ve sent a message  
     - **When** the system is waiting for a response  
     - **Then** I see a “Sending…” status or error if failed  

---

### 👥 Chat Management

6. **Start a new chat**
   - **As a user**, I want to create or join a chat so I can communicate with others.
     - **Given** I’m authenticated  
     - **When** I click “New Chat” or use an invite link  
     - **Then** I’m added to the conversation  

7. **Leave a chat**
   - **As a user**, I want to leave a chat so I no longer receive messages.
     - **Given** I’m in a chat  
     - **When** I click “Leave Chat”  
     - **Then** I am removed from the participant list  
     
8. **Delete a chat**
   - **As a user**, I want to delete a chat so I can keep my chat list clean.
     - **Given** I'm the only user in a chat
     - **When** I click “Leave Chat”  
     - **Then** The chat is deleted from chat list

9. **Manage participants**
   - **As a user**, I want to add/remove users in a group chat to control who can join.
     - **Given** I have the right permissions  
     - **When** I open “Manage Participants”  
     - **Then** I can invite or remove users  

---

### 📅 Scheduling

10. **Schedule interview**
   - **As a recruiter**, I want to schedule an interview with a jobseeker.
     - **Given** I’m in a chat with a jobseeker  
     - **When** I click “Schedule” and choose a time on the cal.com widget
     - **Then** the event is added and the jobseeker is notified in a new message

11. **Respond to interview**
   - **As a jobseeker**, I want to accept or decline an interview.
     - **Given** I receive a scheduling event  
     - **When** I click Accept or Decline  
     - **Then** the system updates the event accordingly  

---

### 🗂️ Profile Management

12. **View profile**
   - **As a user**, I want to view my or others’ profiles so I can learn more about them.
     - **Given** I’m in a chat  
     - **When** I click on the user’s name or avatar  
     - **Then** I see their profile details  

13. **Edit profile**
   - **As a jobseeker**, I want to edit my profile to keep my information up-to-date.
     - **Given** I’m on the profile page  
     - **When** I update fields and click Save  
     - **Then** I get confirmation and the info is stored  

---

### 📊 Dashboards & Insights

14. **Jobseeker dashboard**
   - **As a jobseeker**, I want to see a visual breakdown of my job hunt status.
     - **Given** I go to my dashboard  
     - **When** I view charts and stats  
     - **Then** I can see stages like “Applied,” “Interview,” “Accepted,” etc.

15. **Recruiter dashboard**
   - **As a recruiter**, I want to track active conversations and candidate stages.
     - **Given** I’m on the dashboard  
     - **When** I view stats  
     - **Then** I can see candidates by pipeline stage  

---

### 🚦 Recruitment Status

17. **Update recruitment status**
   - **As a recruiter**, I want to update the status of a job application in a chat.
     - **Given** I’m in a conversation  
     - **When** I update the status (e.g., from “Pending” to “Interview”)  
     - **Then** the badge updates and a message is sent in chat  

18. **View recruitment badge**
   - **As a user**, I want to quickly see the recruitment stage of each chat.
     - **Given** I’m on the chat list  
     - **When** I scan through chats  
     - **Then** I see status badges like “Accepted” or “Rejected”  

---

## 6. **Data Structures**

```typescript
// This is your Prisma schema file
// Learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id       String @id @default(cuid())
  email    String @unique
  password String
  role     Role

  profiles      Profile[]
  conversations Conversation[]
}

model Profile {
  id             String  @id @default(cuid())
  userId         String
  objective      String  @default("")
  contactId      String  @unique
  conversationId String?

  experiences           Experience[] // One profile has many experiences
  educations            Education[] // One profile has many educations
  skills                Skill[] // One profile has many skills
  honorsAwards          HonorsAwards[] // One profile has many honors/awards
  licenseCertifications LicenseCertification[] // One profile has many licenses/certifications

  contact      Contact       @relation(fields: [contactId], references: [id], onDelete: Cascade)
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  Conversation Conversation?

  @@unique([userId, conversationId]) // Composite unique key
}

model Contact {
  id          String        @id @default(cuid())
  phone       String        @default("")
  email       String        @default("")
  linkedin    String?
  portfolio   String?
  city        String        @default("")
  country     String        @default("")
  Profile     Profile?
}

model Experience {
  id             String    @id @default(cuid())
  title          String
  employmentType String
  company        String
  location       String
  locationType   String
  startDate      DateTime
  endDate        DateTime?
  description    String?

  profileId String
  profile   Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)
}

model Education {
  id           String    @id @default(cuid())
  school       String
  degree       String
  fieldOfStudy String
  startDate    DateTime
  endDate      DateTime?
  gpa          Float?
  gpaMax       Float?
  location     String?
  description  String?
  profileId    String
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  profile Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)
}

model Skill {
  id          String @id @default(cuid())
  name        String
  proficiency String

  profileId String
  profile   Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)
}

model LicenseCertification {
  id           String    @id @default(cuid())
  name         String
  issuer       String
  issueDate    DateTime
  expiryDate   DateTime?
  credentialId String?

  profileId String
  profile   Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)
}

model HonorsAwards {
  id          String   @id @default(cuid())
  title       String
  issuer      String
  date        DateTime
  description String?

  profileId String
  profile   Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)
}

model Conversation {
  id          String    @id @default(cuid())
  title       String
  description String?
  status      Status    @default(PENDING)
  userId      String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  messages    Message[]

  user    User     @relation(fields: [userId], references: [id])
  profile Profile? @relation(fields: [profileId], references: [id], onDelete: Cascade)

  profileId String? @unique
}

enum MessagePartContentType {
  TEXT
  ACTION
  POST
  GET
}

enum MessageContentType {
  TEXT_AND_ACTION
  TEXT
}

enum Status {
  ACTIVE
  PENDING
  INTERVIEW
  REJECTED
  ACCEPTED
}

enum Role {
  JOBSEEKER
  RECRUITER
}

model MessagePart {
  id          String                 @id @default(cuid())
  content     String
  contentType MessagePartContentType
  actionUrl   String?
  messageId   String?
  message     Message?               @relation(fields: [messageId], references: [id])
}

model Message {
  id             String              @id @default(cuid())
  conversationId String
  role           String
  content        String
  contentType    MessageContentType?
  parts          MessagePart[]
  createdAt      DateTime            @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
}
```

- Store data in Postgres using defaults. The connection string should look like this: "postgresql://demo:demo@localhost:5432/demo"

### 7. Additional Notes
- **Shadcn**: Ideal for modals (Dialog component), buttons, forms, etc.
- **Chart.js**: Use a line chart, bar chart, pie chart, or any combination to showcase data trends.
- **Optional**: You can add a hover tooltip on each calendar day to preview the note or emoji.

### 8. Roles




| Feature      | JOBSEEKER      |  RECRUITER |
|----------------|----------------|---|
| Start chat | ✅|  ✅|
| Edit recruitment stage | ✅|  ✅|
| Manage chat sharing link & permissions | ✅|  ✅|
| Delete chat (only after leaving chat) | ✅|  ✅|
| Send messages | ✅|  ✅|
| Schedule event | 	❌ | ✅|
| Respond to event |✅| ✅|
| View profile | ✅|  ✅|
| Edit profile | ✅|  	❌ |
| Jobseeker dashboard | ✅|  	❌ |
| Recruiter dashboard | 	❌  |  ✅|