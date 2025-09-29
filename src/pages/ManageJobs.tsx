import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from '@/integrations/firebase/client';
import { collection, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import Header from '@/components/Header';

interface Job {
  id: string;
  title: string;
  location: string;
  description: string;
  // Add other fields as needed
}

const ManageJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!user?.id) return;
      const jobsRef = collection(db, "jobs");
      const q = query(jobsRef, where("companyId", "==", user.id));
      const querySnapshot = await getDocs(q);
      const jobsList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title ?? "",
          location: data.location ?? "",
          description: data.description ?? "",
          // Add other fields as needed
        };
      });
      setJobs(jobsList);
      setLoading(false);
    };
    fetchJobs();
  }, [user]);

  const handleDelete = async (jobId: string) => {
    await deleteDoc(doc(db, "jobs", jobId));
    setJobs(jobs.filter(job => job.id !== jobId));
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Manage Your Posted Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading...</div>
            ) : jobs.length === 0 ? (
              <div>No jobs posted yet.</div>
            ) : (
              <ul className="space-y-4">
                {jobs.map(job => (
                  <li key={job.id} className="border rounded p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">{job.location}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/edit-job/${job.id}`)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(job.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm">
                      {job.description.length > 280
                        ? job.description.slice(0, 280) + '...'
                        : job.description}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ManageJobs;
