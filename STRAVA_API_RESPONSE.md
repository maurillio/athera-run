# Strava API Developer Program - Detailed Response

**Application Name:** Athera Run  
**Website:** https://atherarun.com  
**Category:** Training Platform / AI-Powered Running Coach  
**Date:** November 5, 2025

---

## 1. AI/Machine Learning Usage

### Does your application use AI or machine learning?

**YES** - Our application uses AI/ML in the following ways:

### 1.1 AI for Personalized Training Plan Generation
- **Provider:** OpenAI GPT-4o (direct API, NOT Abacus or other platforms)
- **Purpose:** Generate 100% personalized weekly training plans based on:
  - Athlete profile (level, experience, physiological data)
  - Multiple race goals (A/B/C classification)
  - Real availability (specific training days per modality)
  - Scientific periodization (Base → Build → Peak → Taper)

### 1.2 AI for Intelligent Adjustments
- **Purpose:** Analyze athlete progress and suggest plan modifications based on:
  - Training completion rates
  - Feedback and fatigue reports
  - Performance patterns
  - Recovery status

### 1.3 Virtual Coach Chat
- **Purpose:** Provide 24/7 support through AI-powered chat interface

---

## 2. How Strava Data is Used

### 2.1 Data Flow (Premium Feature Only)
```
Strava Activity → Athera Run Database → Analysis → Display to User
```

### 2.2 Specific Usage
1. **Activity Import:**
   - Distance, duration, pace, heart rate, elevation
   - Activity type (run, cycling, strength training)
   - Date and time of activity

2. **Automatic Association:**
   - Match imported activities with planned workouts
   - Update completion status
   - Calculate adherence percentage

3. **Progress Tracking:**
   - Display completed activities in athlete dashboard
   - Show weekly/monthly metrics
   - Generate progress charts

4. **Smart Analysis (Premium):**
   - Detect patterns (overtraining, under-recovery)
   - Compare actual pace vs. planned pace
   - Identify performance trends

### 2.3 What We DO NOT Do:
- ❌ We DO NOT use Strava data to train AI models
- ❌ We DO NOT share Strava data with third parties
- ❌ We DO NOT sell or monetize Strava data
- ❌ We DO NOT use Strava data for purposes other than the athlete's own training analysis

---

## 3. Compliance with Strava API Terms of Service

### 3.1 Specific Restrictions We Follow

#### 3.1.1 NO AI Model Training
**Our Commitment:**
- Strava data is NEVER used to train, improve, or feed any AI models
- AI models (OpenAI GPT-4o) only receive:
  - Athlete's self-declared profile data (manually entered during onboarding)
  - Training preferences and availability
  - Race goals
- **Strava data is kept completely separate from AI generation process**

#### 3.1.2 Data Usage Policy
```typescript
// Example: How we handle Strava data
interface StravaDataUsage {
  // ✅ ALLOWED USAGE
  display: "Show activities to the athlete who owns them",
  association: "Link activities with planned workouts",
  metrics: "Calculate completion rates and progress",
  
  // ❌ PROHIBITED USAGE (We don't do this)
  aiTraining: "NEVER - Data not used for AI training",
  thirdParty: "NEVER - Data not shared externally",
  monetization: "NEVER - Data not sold or commercialized"
}
```

### 3.2 Technical Implementation

#### 3.2.1 Data Segregation
```
┌─────────────────────────┐
│   AI TRAINING PLANS     │
│   (OpenAI GPT-4o)       │
│                         │
│  INPUT:                 │
│  - Manual profile       │
│  - User preferences     │
│  - Race goals           │
│                         │
│  ❌ NO STRAVA DATA      │
└─────────────────────────┘

┌─────────────────────────┐
│   STRAVA DATA           │
│                         │
│  USAGE:                 │
│  - Display only         │
│  - Progress tracking    │
│  - Completion status    │
│                         │
│  ❌ NOT USED FOR AI     │
└─────────────────────────┘
```

#### 3.2.2 Code-Level Enforcement
```typescript
// Our AI plan generator
async function generateTrainingPlan(profile: AthleteProfile) {
  // ✅ Uses manual data
  const context = {
    level: profile.runningLevel,
    experience: profile.runningYears,
    availability: profile.weeklyAvailability,
    goals: profile.raceGoals,
    // ❌ NEVER includes Strava data
  };
  
  const plan = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: buildPrompt(context) }]
  });
  
  return plan;
}

// Strava data stays separate
async function displayStravaActivities(userId: string) {
  const activities = await getStravaActivities(userId);
  // Only displayed to user, never sent to AI
  return activities;
}
```

### 3.3 Data Storage and Security

#### 3.3.1 Encrypted Storage
- Strava access tokens encrypted in database
- Activity data stored with user isolation
- No cross-user data access

#### 3.3.2 Access Control
- Only the athlete can see their own Strava data
- Admin access does NOT include Strava data viewing
- API endpoints require authentication and user ownership validation

### 3.4 User Transparency

#### 3.4.1 Clear Communication
We explicitly inform users:
- "Strava integration is used only to track your completed workouts"
- "Your Strava data will never be used to train AI models"
- "Your data belongs to you and is not shared with third parties"

#### 3.4.2 Privacy Controls
Users can:
- Disconnect Strava at any time
- View exactly what data we access
- Delete all imported Strava data

---

## 4. Third-Party Access to Strava Data

### 4.1 Third Parties Involved: NONE

**Answer:** NO third parties, platforms, or external tools have access to Strava data.

### 4.2 Data Flow Diagram
```
Strava API
    ↓
Athera Run Backend (PostgreSQL Database)
    ↓
Athera Run Frontend (User's Browser)
    ↓
End User (Athlete)

❌ NO external services
❌ NO data brokers
❌ NO analytics providers with Strava data access
❌ NO AI training platforms
```

### 4.3 Services We Use (Without Strava Data Access)

| Service | Purpose | Has Strava Access? |
|---------|---------|-------------------|
| **OpenAI GPT-4o** | Generate training plans | ❌ NO - Uses only manual profile data |
| **Vercel** | Hosting/Infrastructure | ❌ NO - Does not process Strava data |
| **PostgreSQL** | Database storage | ✅ YES - But only for storage, no external access |
| **Stripe** | Payment processing | ❌ NO - Only handles subscriptions |

**Important:** Even though our database stores Strava data, it's our own controlled infrastructure with no external access or data sharing.

---

## 5. Additional Security Measures

### 5.1 Technical Safeguards
- Token encryption at rest
- HTTPS only communication
- Regular security audits
- Automatic token refresh (no user re-authentication needed)

### 5.2 Compliance Monitoring
- Regular review of API usage patterns
- Automated alerts for suspicious activity
- Quarterly compliance checks

### 5.3 User Rights
- Right to disconnect Strava
- Right to delete all data
- Right to export their data
- Transparent privacy policy

---

## 6. Summary of Compliance

| Requirement | Status | Details |
|-------------|--------|---------|
| **AI Training Restriction** | ✅ COMPLIANT | Strava data NEVER used for AI model training |
| **Data Usage Transparency** | ✅ COMPLIANT | Clear documentation and user communication |
| **Third-Party Sharing** | ✅ COMPLIANT | NO third parties have access |
| **User Control** | ✅ COMPLIANT | Full disconnect and deletion options |
| **Data Security** | ✅ COMPLIANT | Encryption, authentication, isolation |
| **Purpose Limitation** | ✅ COMPLIANT | Only used for athlete's own progress tracking |

---

## 7. Contact Information

**Developer Name:** Maurillio Oliveira  
**Email:** maurillio.oliveira@atherarun.com  
**Application URL:** https://atherarun.com  
**Privacy Policy:** https://atherarun.com/privacy  
**Terms of Service:** https://atherarun.com/terms

---

## 8. Declaration

We, Athera Run, solemnly declare that:

1. ✅ We understand Strava's API Terms of Service
2. ✅ We will NOT use Strava data to train AI models
3. ✅ We will NOT share Strava data with third parties
4. ✅ We will use Strava data ONLY for the athlete's own benefit
5. ✅ We will maintain the highest security and privacy standards
6. ✅ We will immediately notify Strava of any data breaches
7. ✅ We will comply with all Strava brand guidelines

**Date:** November 5, 2025  
**Signature:** Athera Run Development Team

---

**Thank you for reviewing our application. We are committed to being responsible stewards of athlete data and maintaining the trust of the Strava community.**
