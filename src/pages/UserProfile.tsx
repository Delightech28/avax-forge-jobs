import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '@/integrations/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Header from '@/components/Header';

interface Experience {
  title: string;
  company: string;
  period: string;
}

interface Education {
  degree: string;
  school: string;
  period: string;
}

interface User {
  id: string;
  fullName?: string;
  email?: string;
  avatar?: string;
  walletAddress?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  experience?: Experience[];
  education?: Education[];
}

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      setLoading(true);
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUser({ id: userSnap.id, ...userSnap.data() });
      }
      setLoading(false);
    };
    fetchUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found.</div>;

  return (
    <div>
      <Header />
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle>{user.fullName || user.email || 'User Profile'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <Avatar>
                <AvatarImage src={user.avatar || ''} />
                <AvatarFallback>{user.fullName ? user.fullName[0] : '?'}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-lg">{user.fullName || user.email}</div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
                <div className="text-xs">Wallet: {user.walletAddress}</div>
              </div>
            </div>
            {user.bio && <div className="mb-2"><strong>Bio:</strong> {user.bio}</div>}
            {user.location && <div className="mb-2"><strong>Location:</strong> {user.location}</div>}
            {user.skills && user.skills.length > 0 && (
              <div className="mb-2"><strong>Skills:</strong> {user.skills.join(', ')}</div>
            )}
            {user.experience && user.experience.length > 0 && (
              <div className="mb-2">
                <strong>Experience:</strong>
                <ul className="list-disc ml-6">
                  {user.experience.map((exp: Experience, i: number) => (
                    <li key={i}>{exp.title} at {exp.company} ({exp.period})</li>
                  ))}
                </ul>
              </div>
            )}
            {user.education && user.education.length > 0 && (
              <div className="mb-2">
                <strong>Education:</strong>
                <ul className="list-disc ml-6">
                  {user.education.map((edu: Education, i: number) => (
                    <li key={i}>{edu.degree} at {edu.school} ({edu.period})</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
