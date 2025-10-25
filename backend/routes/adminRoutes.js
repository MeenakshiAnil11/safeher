// backend/routes/adminRoutes.js
import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import * as adminCtrl from "../controllers/adminControllers.js";
import { uploadResource, uploadEventBanner } from "../middleware/upload.js";

const router = express.Router();

// ✅ Protect all admin routes with JWT + admin check
router.use(protect, adminOnly);

/** ───────────── USERS ───────────── **/
router.get("/users", adminCtrl.listUsers); // ?q=&role=&active=&page=&limit=
router.get("/users/:id", adminCtrl.getUser);
router.patch("/users/:id/deactivate", adminCtrl.deactivateUser);
router.patch("/users/:id/activate", adminCtrl.activateUser);
router.post("/users/:id/reset-password", adminCtrl.adminResetPassword);
router.post("/users/:id/warn", adminCtrl.warnUser);
router.patch("/users/:id/role", adminCtrl.changeUserRole);

/** ───────────── SOS LOGS ───────────── **/
router.get("/sos", adminCtrl.listSOS); // ?status=&userId=&from=&to=
router.get("/sos/export", adminCtrl.exportSOSCSV);
router.patch("/sos/:id/status", adminCtrl.updateSOSStatus);

/** ───────────── HELPLINES ───────────── **/
router.get("/helplines", adminCtrl.listHelplines);
router.post("/helplines", adminCtrl.createHelpline);
router.patch("/helplines/:id", adminCtrl.updateHelpline);
router.delete("/helplines/:id", adminCtrl.deleteHelpline);

/** ───────────── RESOURCES ───────────── **/
router.get("/resources", adminCtrl.listResources);
router.post("/resources", uploadResource, adminCtrl.createResource);
router.patch("/resources/:id", uploadResource, adminCtrl.updateResource);
router.delete("/resources/:id", adminCtrl.deleteResource);
router.patch("/resources/:id/approve", adminCtrl.approveResource);
router.patch("/resources/:id/verify", adminCtrl.verifyResource);
router.post("/resources/bulk-import", adminCtrl.bulkImportResources);
router.get("/resources/:id/download", adminCtrl.downloadResource);
router.get("/resources/analytics/overview", adminCtrl.getResourceAnalytics);

/** ───────────── EVENTS ───────────── **/
router.get("/events", adminCtrl.listEvents);
router.post("/events", uploadEventBanner, adminCtrl.createEvent);
router.patch("/events/:id", adminCtrl.updateEvent);
router.delete("/events/:id", adminCtrl.deleteEvent);
router.patch("/events/:id/toggle-publish", adminCtrl.toggleEventPublish);

/** ───────────── EXTERNAL DIRECTORIES ───────────── **/
router.get("/directories", adminCtrl.listExternalDirectories);
router.post("/directories", adminCtrl.createExternalDirectory);
router.patch("/directories/:id", adminCtrl.updateExternalDirectory);
router.delete("/directories/:id", adminCtrl.deleteExternalDirectory);

/** ───────────── EXERCISES ───────────── **/
router.get("/exercises", adminCtrl.listExercises);
router.get("/exercises/:id", adminCtrl.getExercise);
router.post("/exercises", adminCtrl.createExercise);
router.patch("/exercises/:id", adminCtrl.updateExercise);
router.delete("/exercises/:id", adminCtrl.deleteExercise);
router.patch("/exercises/:id/approve", adminCtrl.approveExercise);

/** ───────────── USER EXERCISE LOGS ───────────── **/
router.get("/exercise-logs", adminCtrl.listUserExerciseLogs);
router.patch("/exercise-logs/:id", adminCtrl.updateUserExerciseLog);
router.delete("/exercise-logs/:id", adminCtrl.deleteUserExerciseLog);
router.get("/exercise-logs/export", adminCtrl.exportUserExerciseLogsCSV);
router.get("/exercise-logs/analytics", adminCtrl.getExerciseAnalytics);

// Alias routes for user logs (reusing exercise logs controller)
router.get("/user-logs", adminCtrl.listUserExerciseLogs);
router.get("/user-logs/export", adminCtrl.exportUserExerciseLogsCSV);

/** ───────────── EXERCISE ANALYTICS ───────────── **/
router.get("/exercise-analytics", adminCtrl.getExerciseAnalytics);

/** ───────────── EXERCISE REMINDERS ───────────── **/
router.get("/exercise-reminders", adminCtrl.listExerciseReminders);
router.post("/exercise-reminders", adminCtrl.createExerciseReminder);
router.patch("/exercise-reminders/:id", adminCtrl.updateExerciseReminder);
router.delete("/exercise-reminders/:id", adminCtrl.deleteExerciseReminder);

/** ───────────── EXERCISE CHALLENGES ───────────── **/
router.get("/exercise-challenges", adminCtrl.listExerciseChallenges);
router.post("/exercise-challenges", adminCtrl.createExerciseChallenge);
router.patch("/exercise-challenges/:id", adminCtrl.updateExerciseChallenge);
router.delete("/exercise-challenges/:id", adminCtrl.deleteExerciseChallenge);

/** ───────────── QUIZZES ───────────── **/
router.get("/quizzes", adminCtrl.listQuizzes);
router.post("/quizzes", adminCtrl.createQuiz);
router.patch("/quizzes/:id", adminCtrl.updateQuiz);
router.delete("/quizzes/:id", adminCtrl.deleteQuiz);

/** ───────────── FEEDBACK ───────────── **/
router.get("/feedback", adminCtrl.listFeedback);
router.post("/feedback/:id/respond", adminCtrl.respondFeedback);
router.patch("/feedback/:id/escalate", adminCtrl.escalateFeedback);

/** ───────────── HEALTH TRACKING ───────────── **/
router.get("/health", adminCtrl.listHealthRecords);
router.patch("/health/period/:id", adminCtrl.updatePeriodRecord);
router.delete("/health/:id", adminCtrl.deleteHealthRecord);
router.get("/health/export", adminCtrl.exportPeriodData);
router.get("/health/analytics", adminCtrl.getPeriodAnalytics);
router.get("/health/mood-symptoms", adminCtrl.listMoodAndSymptoms);
router.get("/health/mood-analytics", adminCtrl.getMoodAnalytics);

/** ───────────── NOTIFICATIONS ───────────── **/
router.post("/notifications/broadcast", adminCtrl.broadcastNotification);

/** ───────────── REPORTS & ANALYTICS ───────────── **/
// ✅ Admin dashboard stats
router.get("/reports/overview", adminCtrl.reportsOverview);

// Admin profile route
router.get("/profile", adminCtrl.getProfile);
router.put("/profile", adminCtrl.updateProfile);

export default router;
