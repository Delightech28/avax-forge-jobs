import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/integrations/firebase/client';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';

interface Job {
  id: string;
  title: string;
  companyId: string;
  // add other job fields as needed
}

interface Applicant {
  id: string;
  fullName?: string;
  email?: string;
  walletAddress?: string;
  avatar?: string;
  applied_jobs?: string[] | Record<string, boolean>;
  appliedJobs?: string[] | Record<string, boolean>;
  // add other applicant fields as needed
}

const ViewApplicants = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      setLoadingJobs(true);
      if (!user?.id) return;
      const q = query(collection(db, 'jobs'), where('companyId', '==', user.id));
      const snapshot = await getDocs(q);
      setJobs(
        snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title ?? '',
            companyId: data.companyId ?? '',
            // add other job fields as needed
          } as Job;
        })
      );
      setLoadingJobs(false);
    };
    fetchJobs();
  }, [user]);

  const fetchApplicants = async (jobId: string) => {
    setLoadingApplicants(true);
    console.log('Checking applicants for jobId:', jobId);
    // Fetch all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const applicants: Applicant[] = [];
    for (const user of allUsers) {
      const appliedDocRef = doc(db, 'users', user.id, 'applied_jobs', jobId);
      const appliedDocSnap = await getDoc(appliedDocRef);
      if (appliedDocSnap.exists()) {
        applicants.push(user);
      }
    }
    console.log('Applicants found:', applicants);
    setApplicants(applicants);
    setLoadingApplicants(false);
  };

  return (
    <div>
      <Header />
      <div className="max-w-2xl mx-auto mt-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingJobs ? (
              <div>Loading jobs...</div>
            ) : jobs.length === 0 ? (
              <div>No jobs posted yet.</div>
            ) : (
              <div className="space-y-2">
                {jobs.map(job => (
                  <div key={job.id} className="flex items-center justify-between border rounded px-3 py-2">
                    <span className="font-medium">{job.title}</span>
                    <Button
                      size="sm"
                      variant={selectedJobId === job.id ? 'default' : 'outline'}
                      onClick={() => {
                        setSelectedJobId(job.id);
                        fetchApplicants(job.id);
                      }}
                    >
                      View Applicants
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        {selectedJobId && (
          <Card>
            <CardHeader>
              <CardTitle>Applicants for Job</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingApplicants ? (
                <div>Loading applicants...</div>
              ) : applicants.length === 0 ? (
                <div>No applicants found for this job.</div>
              ) : (
                <div className="space-y-4">
                  {applicants.map(app => (
                    <div
                      key={app.id}
                      className="flex items-center space-x-4 cursor-pointer hover:bg-red-200 rounded p-2"
                      onClick={() => navigate(`/user-profile/${app.id}`)}
                    >
                      <Avatar>
                        <AvatarImage src={app.avatar || ''} />
                        <AvatarFallback>{app.fullName ? app.fullName[0] : '?'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{app.fullName || app.email || 'Unknown'}</div>
                        <div className="text-sm text-muted-foreground">{app.email}</div>
                        {/* Wallet address removed for privacy */}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ViewApplicants;
