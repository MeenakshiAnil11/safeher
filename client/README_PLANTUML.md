# PlantUML Diagrams for SafeHer Project

This document contains PlantUML code for generating use case and sequence diagrams for the SafeHer project.

## Files

### Use Case Diagrams
1. **USE_CASE_DIAGRAM.puml** - Comprehensive use case diagram with all features
2. **USE_CASE_DIAGRAM_SIMPLE.puml** - Simplified version for presentation

### Sequence Diagrams
1. **SEQUENCE_DIAGRAMS.puml** - Comprehensive sequence diagrams (7 scenarios)
2. **SEQUENCE_DIAGRAM_SIMPLE.puml** - Simplified sequence diagrams (5 main flows)

### Activity Diagrams
1. **ACTIVITY_DIAGRAMS.puml** - Comprehensive activity diagrams (8 workflows)
2. **ACTIVITY_DIAGRAM_SIMPLE.puml** - Simplified activity diagrams (5 main flows)

### Class Diagrams
1. **CLASS_DIAGRAMS.puml** - Comprehensive class diagrams (8 diagrams)
2. **CLASS_DIAGRAM_SIMPLE.puml** - Simplified class diagrams (3 main views)

### Component Diagrams
1. **COMPONENT_DIAGRAMS.puml** - Comprehensive component diagrams (6 diagrams)
2. **COMPONENT_DIAGRAM_SIMPLE.puml** - Simplified component diagrams (4 main views)

### Deployment Diagrams
1. **DEPLOYMENT_DIAGRAMS.puml** - Comprehensive deployment diagrams (5 diagrams)
2. **DEPLOYMENT_DIAGRAM_SIMPLE.puml** - Simplified deployment diagrams (3 main views)

## How to Generate Diagrams

### Option 1: Online (Recommended)
1. Go to http://www.plantuml.com/plantuml/uml/
2. Copy the contents of either `.puml` file
3. Paste into the editor
4. Click "Submit" to generate the diagram
5. Right-click the image and "Save As" to download

### Option 2: VS Code Extension
1. Install "PlantUML" extension in VS Code
2. Open the `.puml` file
3. Press `Alt+D` (or right-click and select "Preview PlantUML Diagram")
4. Right-click the preview and "Export Diagram" to save as PNG/SVG

### Option 3: Command Line
```bash
# Install PlantUML (requires Java)
# Download from: https://plantuml.com/download

# Generate PNG
java -jar plantuml.jar USE_CASE_DIAGRAM.puml

# Generate SVG
java -jar plantuml.jar -tsvg USE_CASE_DIAGRAM.puml
```

## Diagram Structure

### Actors
- **Guest**: Unauthenticated users
- **User**: Registered users
- **Admin**: Administrators

### Main Packages
1. Authentication & Registration
2. Period & Reproductive Health Tracking
3. Health Monitoring
4. AI Health Assistant
5. Medical Management
6. Safety & Emergency
7. Exercise & Wellness
8. Resources & Education
9. Community & Support
10. Profile & Settings
11. Admin Functions

## Use Cases Included

### Authentication (4 use cases)
- Register, Login, Forgot Password, Logout

### Period Tracking (7 use cases)
- Track Menstrual Cycle, Fertility Tracking, Pregnancy Tracking, Perimenopause Tracking, etc.

### Health Monitoring (7 use cases)
- Record Vitals, Track Symptoms, Log Mood, Track Sleep, Track Nutrition, etc.

### AI Health Assistant (5 use cases)
- Health Risk Prediction, Mood Prediction, Symptom Classification, Exercise Recommendation, etc.

### Medical Management (6 use cases)
- Schedule Appointments, Track Medications, Track Vaccinations, etc.

### Safety & Emergency (6 use cases)
- Trigger SOS Alert, Manage Contacts, View Helplines, Location Tracking, etc.

### Exercise & Wellness (5 use cases)
- Log Exercise, View Recommendations, Join Challenges, etc.

### Resources & Education (7 use cases)
- Browse Resources, View Educational Topics, Search Baby Names, etc.

### Community & Support (5 use cases)
- Submit Feedback, Chat with AI, Pregnancy Chat, etc.

### Profile & Settings (6 use cases)
- View/Edit Profile, Manage Settings, Notifications, etc.

### Admin Functions (11 use cases)
- Manage Users, View SOS Logs, Manage Resources, View Reports, etc.

**Total: 71 Use Cases**

## Sequence Diagrams Included

### SEQUENCE_DIAGRAMS.puml contains:
1. **User Registration & Login** - Complete authentication flow including Google login
2. **Period Tracking** - Period entry and cycle prediction flow
3. **Health Risk Prediction** - ML-based health risk assessment
4. **SOS Alert Flow** - Emergency alert system with email notifications
5. **Exercise Recommendation** - ML-based exercise recommendation
6. **Symptom Classification** - Bayesian ML symptom analysis
7. **Appointment Scheduling** - Medical appointment management with reminders

### SEQUENCE_DIAGRAM_SIMPLE.puml contains:
1. User Login Flow
2. Health Risk Prediction
3. SOS Alert
4. Period Tracking
5. Exercise Recommendation

## Notes

### Use Case Diagrams
- Use `<<include>>` for mandatory relationships
- Use `<<extend>>` for optional relationships
- Colors and styling can be customized in the skinparam sections
- The simplified version is better for presentations and reports

### Sequence Diagrams
- Each diagram shows interaction between Frontend, Backend, Database, and ML Services
- Color coding: Actors (orange), Frontend (blue), Backend (green), ML Services (yellow)
- Diagrams show complete request-response flows
- Use the simple version for project reports, comprehensive version for detailed documentation

### Activity Diagrams Included

#### ACTIVITY_DIAGRAMS.puml contains:
1. **User Registration Process** - Complete registration flow with validation
2. **Period Tracking Process** - Period entry and cycle prediction
3. **Health Risk Prediction** - ML-based risk assessment workflow
4. **SOS Alert Process** - Emergency alert system flow
5. **Exercise Recommendation** - ML-based exercise recommendation workflow
6. **Symptom Classification** - Bayesian ML symptom analysis flow
7. **Appointment Scheduling** - Medical appointment management
8. **Medication Tracking** - Medication management with reminders

#### ACTIVITY_DIAGRAM_SIMPLE.puml contains:
1. User Login Activity
2. Health Risk Prediction Activity
3. SOS Alert Activity
4. Period Tracking Activity
5. Exercise Recommendation Activity

### Activity Diagrams Notes
- Activity diagrams show the step-by-step flow of processes
- Decision points are shown with diamond shapes (if/else)
- Each activity represents a task or action in the system
- Use the simple version for project reports, comprehensive version for detailed process documentation

### Class Diagrams Included

#### CLASS_DIAGRAMS.puml contains:
1. **User & Authentication Classes** - User model, AuthController, ProtectedRoute, AdminRoute
2. **Period Tracking Classes** - Period, FertilityLog, PregnancyLog, PerimenopauseLog, PeriodController
3. **Health Tracking Classes** - Vital, Symptom, MoodLog, Sleep, Nutrition, HealthGoal, HealthController
4. **ML Services Classes** - HealthRiskService, MoodPredictionService, SymptomClassificationService, ExerciseRecommendationService, MLController
5. **Safety & Emergency Classes** - SOSLog, Contact, SafeZone, Helpline, SOSController, EmailService
6. **Medical Management Classes** - Appointment, Medication, Vaccination, Record, MedicalController
7. **Frontend React Components** - Login, Dashboard, PeriodTrackingOverview, HealthRiskPrediction, SymptomClassification, SOSButton, UserHeader
8. **Complete System Overview** - High-level view of all system components and their relationships

#### CLASS_DIAGRAM_SIMPLE.puml contains:
1. Main Classes - User, Period, Vital, Symptom, SOSLog, Appointment, ML Services
2. Controller Classes - AuthController, HealthController, PeriodController, SOSController, MLController
3. Frontend Components - Login, Dashboard, PeriodTracking, HealthTracker, MLDashboard, SOSButton

### Class Diagrams Notes
- Class diagrams show the structure of the system with classes, attributes, and methods
- Relationships are shown with arrows (1-to-many, uses, manages)
- Private attributes/methods use `-`, public use `+`
- Use the simple version for project reports, comprehensive version for detailed system documentation

### Component Diagrams Included

#### COMPONENT_DIAGRAMS.puml contains:
1. **Overall System Architecture** - Frontend, Backend, ML Services, Database, External Services
2. **Frontend Components** - React application structure with routing and shared components
3. **Backend Components** - Express server, controllers, services, models structure
4. **ML Services Components** - Flask APIs, ML models, preprocessing components
5. **Data Flow Components** - Client to database data flow architecture
6. **Deployment Components** - Production deployment architecture with servers and services

#### COMPONENT_DIAGRAM_SIMPLE.puml contains:
1. Main System Components - High-level view of all system layers
2. Frontend Component Structure - React app routing and components
3. Backend Component Structure - Express server and controllers
4. ML Services Component Structure - Flask APIs and ML models

### Component Diagrams Notes
- Component diagrams show the physical architecture and deployment structure
- Components represent deployable units (applications, services, databases)
- Arrows show dependencies and communication between components
- Packages group related components together
- Use the simple version for project reports, comprehensive version for detailed architecture documentation

### Deployment Diagrams Included

#### DEPLOYMENT_DIAGRAMS.puml contains:
1. **Overall System Deployment** - Complete deployment architecture with all servers and services
2. **Production Deployment** - Production environment with load balancers, multiple servers, replica sets
3. **Development Environment** - Local development setup with dev servers and test services
4. **Containerized Deployment** - Docker-based deployment architecture
5. **Network Architecture** - Network zones and security architecture (DMZ, Application Zone, Data Zone)

#### DEPLOYMENT_DIAGRAM_SIMPLE.puml contains:
1. Simple Deployment - Basic deployment architecture
2. Production Deployment - Production setup with load balancing
3. Development Deployment - Local development environment

### Deployment Diagrams Notes
- Deployment diagrams show the physical deployment of software on hardware nodes
- Nodes represent physical or virtual machines/servers
- Components show software deployed on nodes
- Cloud symbols represent cloud services (MongoDB Atlas, Firebase, etc.)
- Arrows show communication paths and network connections
- Port numbers indicate service endpoints
- Use the simple version for project reports, comprehensive version for detailed deployment documentation

