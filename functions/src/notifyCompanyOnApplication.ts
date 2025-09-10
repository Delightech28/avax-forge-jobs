import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// Trigger when a user applies for a job (applied_jobs subcollection)
export const notifyCompanyOnApplication = functions.firestore
  .document('users/{userId}/applied_jobs/{jobId}')
  .onCreate(async (snap, context) => {
    const application = snap.data();
    const jobId = context.params.jobId;
    // Fetch the job to get company info
    const jobSnap = await db.collection('jobs').doc(jobId).get();
    if (!jobSnap.exists) return;
    const job = jobSnap.data();
    const companyId = job.company_id || job.companyId;
    if (!companyId) return;

    // Create a notification for the company
    await db.collection('notifications').add({
      userId: companyId,
      type: 'job_application',
      jobId,
      applicantId: context.params.userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      message: `You have a new application for your job: ${job.title}`,
      read: false,
    });
  });
