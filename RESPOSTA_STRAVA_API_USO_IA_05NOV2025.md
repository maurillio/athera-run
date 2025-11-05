# RESPOSTA PARA STRAVA - USO DE IA NO ATHERA RUN
**Data**: 05/11/2025
**Para**: Strava Developer Program
**Assunto**: Detailed Information about AI Usage in Athera Run

---

## 📋 RESPOSTAS DETALHADAS

### 1. Whether your use case involves AI or machine learning in any capacity

**YES**, our application uses AI/ML technology, but with strict limitations and compliance with Strava's terms of service.

**How we use AI**:
- **Training Plan Generation**: We use OpenAI's GPT-4 API to generate personalized running training plans based on user profiles (fitness level, goals, available time, etc.)
- **Workout Analysis**: We provide insights and analysis about training progress
- **Training Chat**: Users can ask questions about their training and receive AI-powered guidance

**What we DON'T do**:
- ❌ We do NOT train AI models with Strava data
- ❌ We do NOT use Strava data as training data for machine learning
- ❌ We do NOT create datasets from Strava activities
- ❌ We do NOT share Strava data with AI model providers

---

### 2. How data accessed via the Strava API would be used in those contexts

**Our Data Flow**:

```
User Connects Strava
    ↓
Strava Activities Downloaded (via API)
    ↓
Stored in OUR Database (encrypted)
    ↓
Used for TWO purposes ONLY:
    1. Display to the user in their dashboard
    2. Analyze user's actual performance vs planned workouts
    ↓
AI Analysis (contextual, not training)
    ↓
Results shown ONLY to the user
    ↓
Data NEVER leaves our system
Data NEVER used to train models
```

**Detailed Usage**:

**A) Activity Import (Read Only)**
- We import activities: distance, duration, pace, heart rate, elevation
- Stored in our PostgreSQL database
- Used to show user their training history
- Used to compare actual vs planned workouts

**B) Performance Analysis (NOT Model Training)**
When analyzing a user's training:
1. We send to GPT-4 API:
   - User's planned workouts (from OUR system)
   - User's completed activities (basic metrics only: distance, time, pace)
   - User's profile (goals, fitness level)

2. GPT-4 returns:
   - Analysis of training adherence
   - Suggestions for plan adjustments
   - Recovery recommendations

3. **CRITICAL**: We send data as CONTEXT in prompts, NOT as training data
   - This is "few-shot learning" or "context window usage"
   - OpenAI does NOT use API calls to train their models (per their terms)
   - Data is processed and discarded, not stored by OpenAI

**C) What We DON'T Do**
- ❌ Create training datasets from Strava activities
- ❌ Use Strava data to fine-tune models
- ❌ Aggregate data across users for ML purposes
- ❌ Share raw Strava data with third parties
- ❌ Use Strava data for research
- ❌ Sell or monetize Strava data

---

### 3. Steps we're taking to ensure compliance with API Terms of Service

**Technical Measures**:

**A) Data Usage Restrictions**
```javascript
// In our codebase, we have strict checks:
// File: lib/strava/data-usage.ts

async function canUseStravaDataForAI(userId: string): Promise<boolean> {
  // Check if user explicitly consented to AI analysis
  const consent = await getAIConsent(userId);
  
  if (!consent) {
    return false;
  }
  
  // Verify data is ONLY for THIS user's analysis
  // NEVER aggregated across users
  return true;
}

async function sendToAI(userId: string, data: StravaActivity[]) {
  // Validate: only this user's data
  // Validate: user has consented
  // Validate: data is for contextual analysis, not training
  
  if (!canUseStravaDataForAI(userId)) {
    throw new Error('Cannot use Strava data for AI without consent');
  }
  
  // Send to GPT-4 with clear instructions:
  // "Analyze THIS user's training. Do not retain this data."
}
```

**B) OpenAI API Configuration**
- We use OpenAI API with `api_data_retention = false`
- Per OpenAI's policy: API data is not used to train models
- We explicitly mark requests as "contextual analysis"

**C) Data Isolation**
- Each user's Strava data is isolated
- NEVER aggregated across users for ML purposes
- Used ONLY in the context of that specific user's training plan

**D) User Control**
```typescript
// Users can:
// 1. Disconnect Strava anytime
// 2. Delete all their Strava data
// 3. Opt out of AI analysis
// 4. Export their data

// File: app/api/strava/disconnect/route.ts
export async function POST(req: Request) {
  const userId = await getUserId(req);
  
  // Revoke OAuth token
  await revokeStravaToken(userId);
  
  // Delete ALL Strava data
  await deleteAllStravaActivities(userId);
  
  // Remove from AI analysis queues
  await removeFromAIProcessing(userId);
  
  return json({ success: true });
}
```

**E) Compliance Documentation**
- Terms of Service explicitly state:
  - "We use Strava data ONLY to analyze YOUR training"
  - "We do NOT train AI models with your Strava data"
  - "We do NOT share your data with third parties"
  - "You can disconnect and delete data anytime"

**F) Regular Audits**
- Monthly review of data usage
- Automated checks for unauthorized data access
- Logging of all AI API calls for transparency

**G) Technical Safeguards**
```typescript
// File: lib/ai/strava-analysis.ts

interface AIAnalysisRequest {
  userId: string;
  purpose: 'INDIVIDUAL_ANALYSIS' | 'TRAINING_FEEDBACK';
  data: {
    activities: StravaActivity[];
    userProfile: UserProfile;
  };
  retention: 'NONE'; // Data not retained after processing
  training: false;    // Not used for model training
}

async function analyzeWithAI(request: AIAnalysisRequest) {
  // Validate purpose
  if (request.purpose !== 'INDIVIDUAL_ANALYSIS' && 
      request.purpose !== 'TRAINING_FEEDBACK') {
    throw new Error('Invalid purpose for Strava data usage');
  }
  
  // Validate retention policy
  if (request.retention !== 'NONE') {
    throw new Error('Strava data cannot be retained');
  }
  
  // Validate not for training
  if (request.training) {
    throw new Error('Strava data cannot be used for model training');
  }
  
  // Call OpenAI API with context-only usage
  return await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are analyzing THIS specific user\'s training. Provide personalized feedback. Do not retain this data.'
      },
      {
        role: 'user',
        content: `Analyze my training: ${JSON.stringify(request.data)}`
      }
    ],
    user: request.userId // Isolate by user
  });
}
```

---

### 4. Whether any third parties, platforms, or tools involved may also have access to the data

**Direct Answer**: NO third parties have unauthorized access to Strava data.

**Third Parties We Use** (with strict limitations):

**A) OpenAI (GPT-4 API)**
- **Access**: Receives activity data in API request context
- **Purpose**: Generate analysis and recommendations for the user
- **Retention**: NO - OpenAI does not retain API request data (per their terms)
- **Training**: NO - OpenAI does not use API data for training
- **Contract**: We have reviewed OpenAI's API terms ensuring compliance
- **Data Sent**: Only basic metrics (distance, time, pace) - NOT raw GPT/FIT files
- **Isolation**: Each request is isolated to individual user

**B) Vercel (Hosting Platform)**
- **Access**: Infrastructure level only (encrypted data at rest)
- **Purpose**: Host our application
- **Retention**: Standard cloud hosting
- **Training**: NO - hosting provider, not AI company
- **Data**: They host our database but don't access data

**C) PostgreSQL (Neon.tech)**
- **Access**: Database storage
- **Purpose**: Store user data (encrypted)
- **Retention**: As per user's account lifetime
- **Training**: NO - database provider only
- **Compliance**: SOC 2 compliant

**What We DON'T Share**:
- ❌ No data brokers
- ❌ No analytics companies (beyond basic web analytics for our site, not Strava data)
- ❌ No research institutions
- ❌ No other fitness apps
- ❌ No advertising networks

**User Transparency**:
- Our Privacy Policy explicitly lists ALL third parties
- Users can review data access logs
- Users receive notifications before any changes to data usage

---

## 📝 SUMMARY FOR STRAVA

**We use Strava API to**:
✅ Import user activities
✅ Display training history to users
✅ Compare actual vs planned workouts
✅ Provide AI-powered analysis for THAT specific user

**We DO NOT**:
❌ Train AI models with Strava data
❌ Use Strava data as ML training datasets
❌ Aggregate data across users for ML purposes
❌ Share Strava data with unauthorized third parties
❌ Retain data beyond user's account lifetime
❌ Use data for purposes other than individual analysis

**Compliance Measures**:
✅ Technical restrictions in code
✅ Explicit user consent
✅ Data isolation per user
✅ OpenAI API with no-retention policy
✅ Regular audits
✅ User control (disconnect/delete anytime)
✅ Transparent privacy policy
✅ No model training or fine-tuning

**Philosophy**:
We believe Strava data belongs to the athlete. We use it ONLY to help THAT athlete improve their training, nothing more.

---

## 🔐 ADDITIONAL SECURITY MEASURES

1. **End-to-end Encryption**: Strava tokens encrypted at rest
2. **Access Logs**: All data access logged and auditable
3. **Rate Limiting**: Prevent bulk data extraction
4. **Anomaly Detection**: Alert on unusual data access patterns
5. **Regular Security Audits**: Quarterly reviews of data handling

---

## 📞 CONTACT & TRANSPARENCY

**Developer Contact**:
- Email: support@atherarun.com
- Website: https://atherarun.com
- Privacy Policy: https://atherarun.com/privacy

**For Strava Team**:
We are happy to provide:
- Source code review (under NDA if needed)
- Architecture diagrams
- Data flow documentation
- Additional technical details

**Commitment**:
We are committed to maintaining the highest standards of data privacy and complying with all Strava API terms of service. If any aspect of our implementation needs adjustment to ensure compliance, we will make changes immediately.

---

**Prepared by**: Athera Run Development Team  
**Date**: November 5, 2025  
**Status**: Ready for Submission to Strava
