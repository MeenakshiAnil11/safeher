# Database Schema Documentation - SafeHer Project

## Database: MongoDB (Mongoose ODM)

---

## Table 1: Users

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for each user |
| 2 | name | String | Required, Trimmed | User's full name |
| 3 | email | String | Required, Unique, Lowercase, Trimmed | User's email address |
| 4 | password | String | MinLength: 8, Validation: Must contain uppercase, lowercase, number, special character | Hashed password for authentication |
| 5 | phone | String | Optional | User's phone number |
| 6 | dateOfBirth | Date | Optional | User's date of birth |
| 7 | googleId | String | Optional | Google OAuth ID for Google sign-in users |
| 8 | emailVerified | Boolean | Default: false | Email verification status |
| 9 | loginVerificationCode | String | Optional | Code for email-based login verification |
| 10 | loginVerificationExpires | Date | Optional | Expiration date for login verification code |
| 11 | resetPasswordToken | String | Optional | Token for password reset functionality |
| 12 | resetPasswordExpires | Date | Optional | Expiration date for password reset token |
| 13 | role | String | Enum: ["user", "admin", "superadmin"], Default: "user" | User role for access control |
| 14 | isActive | Boolean | Default: true | Account active status |
| 15 | settings.notifications.enablePeriodReminder | Boolean | Default: true | Enable period reminder notifications |
| 16 | settings.notifications.enableOvulationReminder | Boolean | Default: true | Enable ovulation reminder notifications |
| 17 | settings.notifications.reminderDaysBeforePeriod | Number | Default: 2 | Days before period to send reminder |
| 18 | settings.notifications.reminderDaysBeforeOvulation | Number | Default: 1 | Days before ovulation to send reminder |
| 19 | settings.notifications.email | String | Optional, Trimmed | Email for notifications |
| 20 | settings.notifications.phone | String | Optional, Trimmed | Phone for notifications |
| 21 | settings.privacy.enablePinLock | Boolean | Default: false | Enable PIN lock for app access |
| 22 | settings.privacy.pinHash | String | Optional | Hashed PIN for app lock |
| 23 | settings.locale | String | Default: "en" | User's preferred language |
| 24 | subscription.isSubscribed | Boolean | Default: false | Subscription status |
| 25 | subscription.plan | String | Enum: ["free", "premium", "lifetime"], Default: "free" | Subscription plan type |
| 26 | subscription.startDate | Date | Optional | Subscription start date |
| 27 | subscription.endDate | Date | Optional | Subscription end date |
| 28 | subscription.paymentId | String | Optional | Payment gateway transaction ID |
| 29 | subscription.paymentProvider | String | Optional | Payment provider name (razorpay, stripe) |
| 30 | createdAt | Date | Auto-generated | Record creation timestamp |
| 31 | updatedAt | Date | Auto-generated | Record last update timestamp |

---

## Table 2: Periods

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for period record |
| 2 | user | ObjectId | Required, Foreign Key (ref: User) | Reference to user who owns this record |
| 3 | startDate | Date | Required | Period start date |
| 4 | endDate | Date | Required | Period end date |
| 5 | duration | Number | Default: 0, Auto-calculated | Period duration in days |
| 6 | intensity | String | Enum: ["light", "medium", "heavy"], Default: "medium" | Period flow intensity |
| 7 | notes | String | Optional, Trimmed | Additional notes about the period |
| 8 | mood | String | Optional, Trimmed | Mood during period |
| 9 | symptoms | Array of String | Default: [] | Symptoms experienced during period |
| 10 | basalBodyTemperatureC | Number | Optional | Basal body temperature in Celsius |
| 11 | restingHeartRateBpm | Number | Optional | Resting heart rate in BPM |
| 12 | createdAt | Date | Auto-generated | Record creation timestamp |

---

## Table 3: Vitals

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for vital record |
| 2 | user | ObjectId | Required, Foreign Key (ref: User) | Reference to user who owns this record |
| 3 | recordedAt | Date | Required | Date and time when vitals were recorded |
| 4 | weightKg | Number | Optional | Weight in kilograms |
| 5 | heightCm | Number | Optional | Height in centimeters |
| 6 | systolic | Number | Optional | Systolic blood pressure |
| 7 | diastolic | Number | Optional | Diastolic blood pressure |
| 8 | heartRateBpm | Number | Optional | Heart rate in beats per minute |
| 9 | bmi | Number | Optional | Body Mass Index |
| 10 | bloodSugar | Number | Optional | Blood sugar level |
| 11 | bloodSugarNotes | String | Optional, Trimmed | Notes about blood sugar measurement |
| 12 | ironLevel | Number | Optional | Iron level in blood |
| 13 | ironLevelNotes | String | Optional, Trimmed | Notes about iron level |
| 14 | cholesterol | Number | Optional | Cholesterol level |
| 15 | cholesterolNotes | String | Optional, Trimmed | Notes about cholesterol measurement |
| 16 | notes | String | Optional, Trimmed | General notes about vitals |
| 17 | createdAt | Date | Auto-generated | Record creation timestamp |

---

## Table 4: Symptoms

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for symptom record |
| 2 | user | ObjectId | Required, Foreign Key (ref: User) | Reference to user who owns this record |
| 3 | date | Date | Required | Date when symptom occurred |
| 4 | tags | Array of String | Default: [] | Symptom tags/categories |
| 5 | severity | Number | Required, Min: 1, Max: 5 | Symptom severity level (1-5 scale) |
| 6 | notes | String | Optional, Trimmed | Additional notes about the symptom |
| 7 | createdAt | Date | Auto-generated | Record creation timestamp |

---

## Table 5: MoodLogs

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for mood log record |
| 2 | user | ObjectId | Required, Foreign Key (ref: User) | Reference to user who owns this record |
| 3 | date | Date | Required | Date when mood was logged |
| 4 | mood | String | Required | Mood state (e.g., "Happy", "Sad", "Neutral", "Anxious") |
| 5 | symptoms | Array of String | Default: [] | Associated symptoms with mood |
| 6 | notes | String | Optional, Trimmed | Additional notes about mood |
| 7 | createdAt | Date | Auto-generated | Record creation timestamp |

---

## Table 6: Sleep

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for sleep record |
| 2 | user | ObjectId | Required, Foreign Key (ref: User) | Reference to user who owns this record |
| 3 | sleepHours | Number | Required | Hours of sleep |
| 4 | quality | String | Required, Enum: ['Poor', 'Fair', 'Good', 'Excellent'] | Sleep quality rating |
| 5 | bedtime | String | Optional | Bedtime in HH:MM format |
| 6 | wakeTime | String | Optional | Wake time in HH:MM format |
| 7 | notes | String | Optional | Additional notes about sleep |
| 8 | date | Date | Default: Date.now | Date of sleep record |
| 9 | createdAt | Date | Auto-generated | Record creation timestamp |
| 10 | updatedAt | Date | Auto-updated | Record last update timestamp |

---

## Table 7: Nutrition

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for nutrition record |
| 2 | user | ObjectId | Required, Foreign Key (ref: User) | Reference to user who owns this record |
| 3 | meal | String | Required, Enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] | Meal type |
| 4 | calories | Number | Required | Calories consumed |
| 5 | protein | Number | Optional | Protein in grams |
| 6 | carbs | Number | Optional | Carbohydrates in grams |
| 7 | fat | Number | Optional | Fat in grams |
| 8 | hydration | String | Optional | Hydration amount (e.g., "2 liters") |
| 9 | supplements | String | Optional | Supplements taken |
| 10 | notes | String | Optional | Additional nutrition notes |
| 11 | date | Date | Default: Date.now | Date of nutrition record |
| 12 | createdAt | Date | Auto-generated | Record creation timestamp |
| 13 | updatedAt | Date | Auto-updated | Record last update timestamp |

---

## Table 8: Contacts

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for contact record |
| 2 | user | ObjectId | Required, Foreign Key (ref: User) | Reference to user who owns this contact |
| 3 | name | String | Required | Contact's name |
| 4 | number | String | Required | Contact's phone number |
| 5 | relationship | String | Default: "" | Relationship with user |
| 6 | email | String | Default: "" | Contact's email address |
| 7 | fcmToken | String | Default: "" | Firebase Cloud Messaging token for push notifications |
| 8 | notes | String | Default: "" | Additional notes about contact |
| 9 | createdAt | Date | Auto-generated | Record creation timestamp |
| 10 | updatedAt | Date | Auto-generated | Record last update timestamp |

---

## Table 9: SOSLogs

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for SOS alert record |
| 2 | user | ObjectId | Required, Foreign Key (ref: User) | Reference to user who triggered SOS |
| 3 | coords.lat | Number | Optional | Latitude coordinate |
| 4 | coords.lng | Number | Optional | Longitude coordinate |
| 5 | address | String | Optional | Physical address from coordinates |
| 6 | message | String | Optional | Additional message from user |
| 7 | status | String | Enum: ["open", "handled", "closed"], Default: "open" | SOS alert status |
| 8 | handledBy | ObjectId | Optional, Foreign Key (ref: User) | Admin/user who handled the alert |
| 9 | createdAt | Date | Auto-generated | Record creation timestamp |

---

## Table 10: HealthGoals

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for health goal record |
| 2 | user | ObjectId | Required, Foreign Key (ref: User) | Reference to user who owns this goal |
| 3 | category | String | Required, Enum: ["weight", "blood_pressure", "exercise", "sleep", "nutrition", "steps", "meditation"] | Goal category |
| 4 | title | String | Required | Goal title |
| 5 | description | String | Optional | Goal description |
| 6 | targetValue | Number | Required | Target value to achieve |
| 7 | currentValue | Number | Default: 0 | Current progress value |
| 8 | unit | String | Default: "" | Unit of measurement (kg, minutes, hours, etc.) |
| 9 | deadline | Date | Optional | Goal deadline |
| 10 | status | String | Enum: ["active", "completed", "paused"], Default: "active" | Goal status |
| 11 | progress | Number | Default: 0, Min: 0, Max: 100, Auto-calculated | Progress percentage |
| 12 | createdAt | Date | Auto-generated | Record creation timestamp |
| 13 | updatedAt | Date | Auto-updated | Record last update timestamp |

---

## Table 11: PregnancyLogs

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for pregnancy log record |
| 2 | user | ObjectId | Required, Foreign Key (ref: User) | Reference to user who owns this record |
| 3 | date | Date | Required | Date of log entry |
| 4 | week | Number | Required | Pregnancy week (1-40) |
| 5 | trimester | String | Required, Enum: ["first", "second", "third"] | Current trimester |
| 6 | weight | Number | Optional | Weight in kg (legacy field) |
| 7 | weightKg | Number | Optional | Weight in kg |
| 8 | weightGain | Number | Optional | Weight gain from pre-pregnancy in kg |
| 9 | symptoms | Array of Objects | Default: [] | Symptoms array with name, intensity, duration |
| 10 | nausea | Boolean | Default: false | Nausea symptom flag |
| 11 | vomiting | Boolean | Default: false | Vomiting symptom flag |
| 12 | fatigue | Boolean | Default: false | Fatigue symptom flag |
| 13 | moodSwings | Boolean | Default: false | Mood swings symptom flag |
| 14 | foodCravings | Boolean | Default: false | Food cravings flag |
| 15 | foodAversions | Boolean | Default: false | Food aversions flag |
| 16 | breastTenderness | Boolean | Default: false | Breast tenderness flag |
| 17 | frequentUrination | Boolean | Default: false | Frequent urination flag |
| 18 | backPain | Boolean | Default: false | Back pain flag |
| 19 | heartburn | Boolean | Default: false | Heartburn flag |
| 20 | constipation | Boolean | Default: false | Constipation flag |
| 21 | swelling | Boolean | Default: false | Swelling flag |
| 22 | insomnia | Boolean | Default: false | Insomnia flag |
| 23 | fetalMovement | Boolean | Default: false | Fetal movement detected |
| 24 | kickCount | Number | Default: 0 | Number of fetal kicks |
| 25 | systolic | Number | Optional | Systolic blood pressure |
| 26 | diastolic | Number | Optional | Diastolic blood pressure |
| 27 | bloodSugar | Number | Optional | Blood sugar level in mg/dL |
| 28 | mood | String | Enum: ["happy", "anxious", "excited", "worried", "calm", "irritable", "emotional", "neutral"], Default: "neutral" | Current mood |
| 29 | energy | Number | Min: 1, Max: 10, Default: 5 | Energy level (1-10 scale) |
| 30 | stress | Number | Min: 1, Max: 10, Default: 5 | Stress level (1-10 scale) |
| 31 | sleepHours | Number | Optional, Min: 0, Max: 24 | Hours of sleep |
| 32 | sleepQuality | String | Enum: ["poor", "fair", "good", "excellent"], Default: "good" | Sleep quality rating |
| 33 | mealsEaten | Number | Default: 3 | Number of meals eaten |
| 34 | waterIntake | Number | Optional | Water intake in liters |
| 35 | supplements | Array of String | Default: [] | Supplements taken |
| 36 | exercise | Boolean | Default: false | Exercise done flag |
| 37 | exerciseType | String | Optional | Type of exercise |
| 38 | exerciseDuration | Number | Optional | Exercise duration in minutes |
| 39 | doctorVisit | Boolean | Default: false | Doctor visit flag |
| 40 | ultrasound | Boolean | Default: false | Ultrasound done flag |
| 41 | bloodTest | Boolean | Default: false | Blood test done flag |
| 42 | medications | Array of String | Default: [] | Medications taken |
| 43 | notes | String | Optional, Trimmed | Additional notes |
| 44 | createdAt | Date | Auto-generated | Record creation timestamp |
| 45 | updatedAt | Date | Auto-updated | Record last update timestamp |

---

## Table 12: FertilityLogs

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for fertility log record |
| 2 | user | ObjectId | Required, Foreign Key (ref: User) | Reference to user who owns this record |
| 3 | date | Date | Required | Date of log entry |
| 4 | bbt | Number | Optional | Basal Body Temperature in Celsius |
| 5 | cervicalMucus | String | Enum: ["dry", "sticky", "creamy", "watery", "egg-white", "none"], Default: "none" | Cervical mucus type |
| 6 | cervicalPosition | String | Enum: ["low", "medium", "high", "soft", "firm", "open", "closed"], Default: "medium" | Cervical position |
| 7 | ovulationTest | String | Enum: ["negative", "positive", "peak", "not-tested"], Default: "not-tested" | Ovulation test result |
| 8 | intercourse | Boolean | Default: false | Intercourse occurred flag |
| 9 | intercourseTime | String | Optional | Time of intercourse (Morning, Afternoon, Evening, Night) |
| 10 | symptoms | Array of Objects | Default: [] | Symptoms with name and intensity |
| 11 | mood | String | Enum: ["happy", "sad", "anxious", "irritable", "calm", "energetic", "tired", "neutral"], Default: "neutral" | Current mood |
| 12 | energy | Number | Min: 1, Max: 10, Default: 5 | Energy level (1-10 scale) |
| 13 | stress | Number | Min: 1, Max: 10, Default: 5 | Stress level (1-10 scale) |
| 14 | sleepHours | Number | Optional, Min: 0, Max: 24 | Hours of sleep |
| 15 | sleepQuality | String | Enum: ["poor", "fair", "good", "excellent"], Default: "good" | Sleep quality rating |
| 16 | medications | Array of String | Default: [] | Medications taken |
| 17 | supplements | Array of String | Default: [] | Supplements taken |
| 18 | notes | String | Optional, Trimmed | Additional notes |
| 19 | cycleDay | Number | Optional | Day in menstrual cycle |
| 20 | phase | String | Enum: ["menstrual", "follicular", "ovulatory", "luteal"], Default: "follicular" | Menstrual cycle phase |
| 21 | createdAt | Date | Auto-generated | Record creation timestamp |
| 22 | updatedAt | Date | Auto-updated | Record last update timestamp |

---

## Table 13: PerimenopauseLogs

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for perimenopause log record |
| 2 | user | ObjectId | Required, Foreign Key (ref: User) | Reference to user who owns this record |
| 3 | date | Date | Required | Date of log entry |
| 4 | cycleLength | Number | Optional | Cycle length in days |
| 5 | periodLength | Number | Optional | Period length in days |
| 6 | periodFlow | String | Enum: ["light", "normal", "heavy", "very-heavy", "spotting", "none"], Default: "normal" | Period flow intensity |
| 7 | cycleIrregularity | String | Enum: ["regular", "slightly-irregular", "very-irregular", "missed"], Default: "regular" | Cycle regularity status |
| 8 | hotFlashes | Boolean | Default: false | Hot flashes symptom |
| 9 | nightSweats | Boolean | Default: false | Night sweats symptom |
| 10 | moodSwings | Boolean | Default: false | Mood swings symptom |
| 11 | irritability | Boolean | Default: false | Irritability symptom |
| 12 | anxiety | Boolean | Default: false | Anxiety symptom |
| 13 | depression | Boolean | Default: false | Depression symptom |
| 14 | fatigue | Boolean | Default: false | Fatigue symptom |
| 15 | sleepProblems | Boolean | Default: false | Sleep problems flag |
| 16 | memoryIssues | Boolean | Default: false | Memory issues flag |
| 17 | concentrationProblems | Boolean | Default: false | Concentration problems flag |
| 18 | weightGain | Boolean | Default: false | Weight gain flag |
| 19 | jointPain | Boolean | Default: false | Joint pain flag |
| 20 | headaches | Boolean | Default: false | Headaches flag |
| 21 | breastTenderness | Boolean | Default: false | Breast tenderness flag |
| 22 | vaginalDryness | Boolean | Default: false | Vaginal dryness flag |
| 23 | decreasedLibido | Boolean | Default: false | Decreased libido flag |
| 24 | urinaryProblems | Boolean | Default: false | Urinary problems flag |
| 25 | symptomIntensity | String | Enum: ["mild", "moderate", "severe"], Default: "mild" | Overall symptom intensity |
| 26 | hotFlashCount | Number | Default: 0 | Number of hot flashes |
| 27 | hotFlashDuration | Number | Optional | Hot flash duration in minutes |
| 28 | sleepHours | Number | Optional, Min: 0, Max: 24 | Hours of sleep |
| 29 | sleepQuality | String | Enum: ["poor", "fair", "good", "excellent"], Default: "good" | Sleep quality rating |
| 30 | sleepInterruptions | Number | Default: 0 | Number of sleep interruptions |
| 31 | mood | String | Enum: ["happy", "sad", "anxious", "irritable", "calm", "energetic", "tired", "neutral", "emotional"], Default: "neutral" | Current mood |
| 32 | energy | Number | Min: 1, Max: 10, Default: 5 | Energy level (1-10 scale) |
| 33 | stress | Number | Min: 1, Max: 10, Default: 5 | Stress level (1-10 scale) |
| 34 | weight | Number | Optional | Weight in kg |
| 35 | weightChange | Number | Optional | Weight change from baseline in kg |
| 36 | exercise | Boolean | Default: false | Exercise done flag |
| 37 | exerciseType | String | Optional | Type of exercise |
| 38 | exerciseDuration | Number | Optional | Exercise duration in minutes |
| 39 | activityLevel | String | Enum: ["sedentary", "light", "moderate", "active", "very-active"], Default: "moderate" | Activity level |
| 40 | mealsEaten | Number | Default: 3 | Number of meals eaten |
| 41 | waterIntake | Number | Optional | Water intake in liters |
| 42 | supplements | Array of String | Default: [] | Supplements taken |
| 43 | caffeineIntake | Number | Optional | Caffeine intake in cups |
| 44 | medications | Array of String | Default: [] | Medications taken |
| 45 | hormoneTherapy | Boolean | Default: false | Hormone therapy flag |
| 46 | alternativeTreatments | Array of String | Default: [] | Alternative treatments |
| 47 | doctorVisit | Boolean | Default: false | Doctor visit flag |
| 48 | bloodTest | Boolean | Default: false | Blood test flag |
| 49 | notes | String | Optional, Trimmed | Additional notes |
| 50 | createdAt | Date | Auto-generated | Record creation timestamp |
| 51 | updatedAt | Date | Auto-updated | Record last update timestamp |

---

## Table 14: Appointments

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for appointment record |
| 2 | user | ObjectId | Required, Foreign Key (ref: User) | Reference to user who owns this appointment |
| 3 | title | String | Required | Appointment title |
| 4 | date | Date | Required | Appointment date |
| 5 | time | String | Required | Appointment time |
| 6 | type | String | Enum: ["prenatal", "ultrasound", "blood_test", "consultation", "emergency", "other"], Default: "prenatal" | Appointment type |
| 7 | doctor | String | Optional | Doctor's name |
| 8 | location | String | Optional | Appointment location |
| 9 | notes | String | Optional | Additional notes |
| 10 | reminder | Boolean | Default: true | Enable reminder flag |
| 11 | reminderTime | Number | Default: 1 | Hours before appointment to send reminder |
| 12 | createdAt | Date | Auto-generated | Record creation timestamp |
| 13 | updatedAt | Date | Auto-updated | Record last update timestamp |

---

## Table 15: Medications

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for medication record |
| 2 | user | ObjectId | Required, Foreign Key (ref: User) | Reference to user who owns this medication |
| 3 | name | String | Required | Medication name |
| 4 | dosage | String | Optional | Medication dosage |
| 5 | frequency | String | Enum: ["daily", "twice_daily", "three_times", "weekly", "as_needed"], Default: "daily" | Frequency of medication |
| 6 | times | Array of String | Default: [] | Array of times like ["08:00", "20:00"] |
| 7 | startDate | Date | Required | Medication start date |
| 8 | endDate | Date | Optional | Medication end date |
| 9 | notes | String | Optional | Additional notes |
| 10 | reminder | Boolean | Default: true | Enable reminder flag |
| 11 | createdAt | Date | Auto-generated | Record creation timestamp |
| 12 | updatedAt | Date | Auto-updated | Record last update timestamp |

---

## Table 16: Vaccinations

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for vaccination record |
| 2 | user | ObjectId | Required, Foreign Key (ref: User) | Reference to user who owns this record |
| 3 | name | String | Required | Vaccination name |
| 4 | date | Date | Required | Vaccination date |
| 5 | nextDue | Date | Optional | Next vaccination due date |
| 6 | doctor | String | Optional | Doctor's name |
| 7 | notes | String | Optional | Additional notes |
| 8 | reminder | Boolean | Default: true | Enable reminder flag |
| 9 | createdAt | Date | Auto-generated | Record creation timestamp |
| 10 | updatedAt | Date | Auto-updated | Record last update timestamp |

---

## Table 17: Records

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for medical record |
| 2 | user | ObjectId | Required, Foreign Key (ref: User) | Reference to user who owns this record |
| 3 | title | String | Required | Record title |
| 4 | category | String | Enum: ["prescription", "lab", "imaging", "discharge", "other"], Default: "other" | Record category |
| 5 | fileUrl | String | Required | File URL or path |
| 6 | takenAt | Date | Optional | Date when record was taken |
| 7 | notes | String | Optional, Trimmed | Additional notes |
| 8 | createdAt | Date | Auto-generated | Record creation timestamp |

---

## Table 18: Helplines

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for helpline record |
| 2 | name | String | Required | Helpline name |
| 3 | number | String | Required | Helpline phone number |
| 4 | region | String | Optional | Region/area covered |
| 5 | category | String | Enum: ["police", "ambulance", "women", "ngo", "other"], Default: "other" | Helpline category |
| 6 | notes | String | Optional | Additional notes |
| 7 | active | Boolean | Default: true | Active status |
| 8 | createdAt | Date | Auto-generated | Record creation timestamp |

---

## Table 19: Resources

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for resource record |
| 2 | title | String | Required | Resource title |
| 3 | description | String | Optional | Resource description |
| 4 | url | String | Optional | Resource URL |
| 5 | category | String | Optional | Resource category |
| 6 | region | String | Optional | Region/area |
| 7 | type | String | Enum: ["Article", "Guide", "Video", "PDF", "Checklist", "External Link"], Default: "Article" | Resource type |
| 8 | lang | Array of String | Default: [] | Languages supported |
| 9 | tags | Array of String | Default: [] | Resource tags |
| 10 | source.name | String | Optional | Source name |
| 11 | source.url | String | Optional | Source URL |
| 12 | approved | Boolean | Default: false | Approval status |
| 13 | verified | Boolean | Default: false | Verification status |
| 14 | submittedBy | ObjectId | Optional, Foreign Key (ref: User) | User who submitted the resource |
| 15 | filePath | String | Optional | File path for uploaded files |
| 16 | downloadCount | Number | Default: 0 | Download count |
| 17 | createdAt | Date | Auto-generated | Record creation timestamp |
| 18 | updatedAt | Date | Auto-updated | Record last update timestamp |

---

## Table 20: Feedback

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for feedback record |
| 2 | userId | ObjectId | Required, Foreign Key (ref: User) | Reference to user who submitted feedback |
| 3 | subject | String | Optional | Feedback subject |
| 4 | category | String | Enum: ["Bug", "Suggestion", "Other"], Default: "Other" | Feedback category |
| 5 | message | String | Optional | Feedback message |
| 6 | rating | Number | Optional | Rating score |
| 7 | screenshotUrl | String | Optional | Screenshot URL if provided |
| 8 | status | String | Enum: ["New", "Reviewed", "In Progress", "Resolved", "Escalated"], Default: "New" | Feedback status |
| 9 | adminReply | String | Optional | Admin's reply to feedback |
| 10 | updatedByUser | Boolean | Default: false | Flag if updated by user |
| 11 | upvotes | Array of Objects | Default: [] | Array of user upvotes with userId and timestamp |
| 12 | createdAt | Date | Auto-generated | Record creation timestamp |
| 13 | updatedAt | Date | Auto-generated | Record last update timestamp |

---

## Table 21: Exercises

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for exercise record |
| 2 | user | ObjectId | Optional, Foreign Key (ref: User) | Reference to user (optional for admin-created exercises) |
| 3 | name | String | Optional | Exercise name (for admin-managed exercises) |
| 4 | phase | String | Optional | Menstrual cycle phase |
| 5 | category | String | Optional | Exercise category |
| 6 | difficulty | String | Optional | Exercise difficulty level |
| 7 | approved | Boolean | Default: false | Approval status |
| 8 | videoLink | String | Optional | YouTube video link |
| 9 | type | String | Enum: ['Yoga', 'Running', 'Walking', 'Strength Training', 'Cycling', 'Others'] | Exercise type |
| 10 | duration | Number | Optional | Duration in minutes |
| 11 | intensity | String | Enum: ['Low', 'Medium', 'High'] | Exercise intensity |
| 12 | caloriesBurned | Number | Optional | Calories burned |
| 13 | notes | String | Optional | Additional notes |
| 14 | date | Date | Default: Date.now | Exercise date |
| 15 | createdAt | Date | Auto-generated | Record creation timestamp |
| 16 | updatedAt | Date | Auto-updated | Record last update timestamp |

---

## Table 22: UserExerciseLogs

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for exercise log record |
| 2 | user | ObjectId | Required, Foreign Key (ref: User) | Reference to user who owns this log |
| 3 | exercise | ObjectId | Required, Foreign Key (ref: Exercise) | Reference to exercise performed |
| 4 | date | Date | Required | Date when exercise was performed |
| 5 | phase | String | Optional | Menstrual cycle phase |
| 6 | category | String | Optional | Exercise category |
| 7 | completionStatus | String | Enum: ["completed", "skipped", "incomplete"], Default: "completed" | Completion status |
| 8 | notes | String | Optional | Additional notes |
| 9 | createdAt | Date | Auto-generated | Record creation timestamp |

---

## Table 23: ExerciseChallenges

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for challenge record |
| 2 | title | String | Required, Trimmed | Challenge title |
| 3 | description | String | Required, Trimmed | Challenge description |
| 4 | startDate | Date | Required | Challenge start date |
| 5 | endDate | Date | Required | Challenge end date |
| 6 | targetParticipants | Number | Required, Min: 1 | Target number of participants |
| 7 | reward | String | Optional, Trimmed | Challenge reward |
| 8 | active | Boolean | Default: true | Challenge active status |
| 9 | participants | Array of Objects | Default: [] | Participants with user, joinedAt, completedAt, progress |
| 10 | createdBy | ObjectId | Required, Foreign Key (ref: User) | User who created the challenge |
| 11 | createdAt | Date | Auto-generated | Record creation timestamp |
| 12 | updatedAt | Date | Auto-generated | Record last update timestamp |

---

## Table 24: ExerciseReminders

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for reminder record |
| 2 | title | String | Required, Trimmed | Reminder title |
| 3 | time | String | Required, Format: HH:MM | Reminder time |
| 4 | days | Array of String | Required | Days of week: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] |
| 5 | active | Boolean | Default: true | Reminder active status |
| 6 | createdBy | ObjectId | Required, Foreign Key (ref: User) | User who created the reminder |
| 7 | createdAt | Date | Auto-generated | Record creation timestamp |
| 8 | updatedAt | Date | Auto-generated | Record last update timestamp |

---

## Table 25: BabyNames

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for baby name record |
| 2 | name | String | Required, Unique | Baby name |
| 3 | gender | String | Required, Enum: ["boy", "girl", "unisex"] | Gender category |
| 4 | meaning | String | Required | Name meaning |
| 5 | origin | String | Required | Name origin |
| 6 | pronunciation | String | Optional | Name pronunciation guide |
| 7 | popularity | Number | Min: 1, Max: 5, Default: 3 | Popularity rating (1-5) |
| 8 | createdAt | Date | Auto-generated | Record creation timestamp |

---

## Table 26: BookmarkedNames

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for bookmarked name record |
| 2 | user | ObjectId | Required, Foreign Key (ref: User) | Reference to user who bookmarked |
| 3 | name | String | Required | Baby name |
| 4 | gender | String | Required, Enum: ["boy", "girl", "unisex"] | Gender category |
| 5 | meaning | String | Required | Name meaning |
| 6 | origin | String | Required | Name origin |
| 7 | pronunciation | String | Optional | Name pronunciation guide |
| 8 | notes | String | Optional | User's personal notes |
| 9 | createdAt | Date | Auto-generated | Record creation timestamp |
| 10 | updatedAt | Date | Auto-updated | Record last update timestamp |

---

## Table 27: PregnancyResources

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for resource record |
| 2 | title | String | Required | Resource title |
| 3 | type | String | Required, Enum: ["article", "video", "faq"] | Resource type |
| 4 | trimester | String | Required, Enum: ["first", "second", "third"] | Relevant trimester |
| 5 | isPaid | Boolean | Default: false | Paid content flag |
| 6 | thumbnail | String | Optional | Thumbnail image URL |
| 7 | snippet | String | Required | Resource preview snippet |
| 8 | content | String | Optional | Full content (article text or video URL) |
| 9 | readTime | String | Optional | Reading time for articles |
| 10 | duration | String | Optional | Duration for videos |
| 11 | questions | Array of Objects | Default: [] | FAQ questions and answers |
| 12 | tags | Array of String | Default: [] | Resource tags |
| 13 | createdAt | Date | Auto-generated | Record creation timestamp |
| 14 | updatedAt | Date | Auto-updated | Record last update timestamp |

---

## Table 28: PregnancyChats

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for chat record |
| 2 | user | ObjectId | Required, Foreign Key (ref: User) | Reference to user who owns this chat |
| 3 | messages | Array of Objects | Default: [] | Chat messages with type, message, timestamp, isError, isWelcome |
| 4 | sessionId | String | Required | Unique session identifier |
| 5 | createdAt | Date | Auto-generated | Record creation timestamp |
| 6 | updatedAt | Date | Auto-updated | Record last update timestamp |

---

## Table 29: WeeklyMessages

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for weekly message record |
| 2 | week | Number | Required, Min: 1, Max: 40 | Pregnancy week |
| 3 | trimester | String | Required, Enum: ["first", "second", "third"] | Trimester |
| 4 | title | String | Required | Message title |
| 5 | message | String | Required | Message content |
| 6 | emoji | String | Required | Emoji for message |
| 7 | tip | String | Required | Tip or advice |
| 8 | color | String | Required | Color code for display |
| 9 | isActive | Boolean | Default: true | Active status |
| 10 | createdAt | Date | Auto-generated | Record creation timestamp |
| 11 | updatedAt | Date | Auto-updated | Record last update timestamp |

---

## Table 30: PartnerAccess

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for partner access record |
| 2 | user | ObjectId | Required, Foreign Key (ref: User) | Reference to user granting access |
| 3 | accessToken | String | Required, Unique | Unique access token |
| 4 | partnerName | String | Required | Partner's name |
| 5 | partnerEmail | String | Optional | Partner's email |
| 6 | permissions.viewProgress | Boolean | Default: true | Permission to view progress |
| 7 | permissions.viewLogs | Boolean | Default: true | Permission to view logs |
| 8 | permissions.viewAppointments | Boolean | Default: true | Permission to view appointments |
| 9 | permissions.viewMessages | Boolean | Default: true | Permission to view messages |
| 10 | permissions.receiveNotifications | Boolean | Default: true | Permission to receive notifications |
| 11 | isActive | Boolean | Default: true | Access active status |
| 12 | expiresAt | Date | Optional | Access expiration date |
| 13 | lastAccessed | Date | Optional | Last access timestamp |
| 14 | createdAt | Date | Auto-generated | Record creation timestamp |
| 15 | updatedAt | Date | Auto-updated | Record last update timestamp |

---

## Table 31: SafeZones

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for safe zone record |
| 2 | user | ObjectId | Required, Foreign Key (ref: User) | Reference to user who owns this safe zone |
| 3 | name | String | Required | Safe zone name |
| 4 | description | String | Optional | Safe zone description |
| 5 | latitude | Number | Required | Latitude coordinate |
| 6 | longitude | Number | Required | Longitude coordinate |
| 7 | radius | Number | Required, Default: 100 | Radius in meters |
| 8 | lastVisited | Date | Optional | Last visit timestamp |
| 9 | isActive | Boolean | Default: true | Active status |
| 10 | createdAt | Date | Auto-generated | Record creation timestamp |
| 11 | updatedAt | Date | Auto-updated | Record last update timestamp |

---

## Table 32: EducationalTopics

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for educational topic |
| 2 | title | String | Required, Trimmed | Topic title |
| 3 | category | String | Required, Trimmed | Topic category |
| 4 | difficulty | String | Required, Enum: ["Beginner", "Intermediate", "Advanced", "Important"] | Difficulty level |
| 5 | readTime | String | Required, Trimmed | Estimated reading time |
| 6 | content | String | Required | Topic content |
| 7 | keyPoints | Array of String | Default: [] | Key points array |
| 8 | links | Array of Objects | Default: [] | Related links with label and url |
| 9 | icon | String | Required, Trimmed | Icon identifier |
| 10 | isPaid | Boolean | Default: false | Paid content flag |
| 11 | fullContent | String | Default: "" | Full content for paid users |
| 12 | isTip | Boolean | Default: false | Tip flag |
| 13 | isApproved | Boolean | Default: true | Approval status |
| 14 | approvalStatus | String | Enum: ["pending", "approved", "rejected"], Default: "approved" | Approval status |
| 15 | createdAt | Date | Auto-generated | Record creation timestamp |
| 16 | updatedAt | Date | Auto-updated | Record last update timestamp |

---

## Table 33: Categories

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for category |
| 2 | name | String | Required, Unique, Trimmed | Category name |
| 3 | description | String | Optional, Trimmed | Category description |
| 4 | createdAt | Date | Auto-generated | Record creation timestamp |
| 5 | updatedAt | Date | Auto-updated | Record last update timestamp |

---

## Table 34: ChatHistory

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for chat history record |
| 2 | user | ObjectId | Required, Foreign Key (ref: User) | Reference to user who owns this chat |
| 3 | messages | Array of Objects | Default: [] | Messages with role (user/assistant), content, timestamp |
| 4 | createdAt | Date | Auto-generated | Record creation timestamp |
| 5 | updatedAt | Date | Auto-updated | Record last update timestamp |

---

## Table 35: Quizzes

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for quiz record |
| 2 | title | String | Required | Quiz title |
| 3 | description | String | Optional | Quiz description |
| 4 | type | String | Enum: ["Quiz", "Assessment", "Survey"], Default: "Quiz" | Quiz type |
| 5 | url | String | Optional | Link to quiz engine or external quiz |
| 6 | category | String | Optional | Quiz category (e.g., "Mental Health", "Safety") |
| 7 | active | Boolean | Default: true | Active status |
| 8 | createdAt | Date | Auto-generated | Record creation timestamp |
| 9 | updatedAt | Date | Auto-updated | Record last update timestamp |

---

## Table 36: Events

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for event record |
| 2 | title | String | Required | Event title |
| 3 | description | String | Optional | Event description |
| 4 | date | Date | Required | Event date |
| 5 | time | String | Optional | Event time |
| 6 | location | String | Optional | Physical location or "Online" |
| 7 | url | String | Optional | Registration/join URL |
| 8 | bannerImage | String | Optional | Image URL or file path |
| 9 | published | Boolean | Default: false | Published status |
| 10 | createdAt | Date | Auto-generated | Record creation timestamp |
| 11 | updatedAt | Date | Auto-updated | Record last update timestamp |

---

## Table 37: ExternalDirectories

| No | Field Name | Datatype (Size) | Key Constraints | Description of the field |
|---|---|---|---|---|
| 1 | _id | ObjectId | Primary Key, Auto-generated | Unique identifier for directory record |
| 2 | name | String | Required | Directory name (e.g., "Government Resources", "NGO Directory") |
| 3 | type | String | Required, Enum: ["Government", "NGO", "International", "Private"] | Directory type |
| 4 | description | String | Optional | Directory description |
| 5 | url | String | Required | Directory URL |
| 6 | region | String | Optional | Region (e.g., "India", "Global") |
| 7 | order | Number | Default: 0 | Sorting order |
| 8 | active | Boolean | Default: true | Active status |
| 9 | createdAt | Date | Auto-generated | Record creation timestamp |
| 10 | updatedAt | Date | Auto-updated | Record last update timestamp |

---

## Summary

**Total Tables: 37**

**Database Type:** MongoDB (NoSQL Document Database)

**ODM Used:** Mongoose

**Key Features:**
- ObjectId as Primary Key for all tables
- Foreign Key relationships using ObjectId references
- Automatic timestamps (createdAt, updatedAt) for most tables
- Enum constraints for predefined value sets
- Default values for optional fields
- Array fields for storing multiple values
- Nested objects for complex data structures

