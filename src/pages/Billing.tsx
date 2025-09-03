import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from '@/integrations/firebase/client';
import { collection, query, where, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";

const Billing = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.id) return;
      const txRef = collection(db, "transactions");
      const q = query(txRef, where("userId", "==", user.id));
      const querySnapshot = await getDocs(q);
      const txList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(txList);
      setLoading(false);
    };
    fetchTransactions();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Loading...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center text-muted-foreground">No transactions found.</div>
              ) : (
                <ul className="space-y-4">
                  {transactions.map(tx => {
                    // Format date and time
                    let formattedDate = '';
                    try {
                      const d = new Date(tx.date);
                      formattedDate = d.toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                      });
                    } catch {
                      formattedDate = tx.date;
                    }
                    return (
                      <li key={tx.id} className="border rounded p-4 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-lg">{tx.type}</h3>
                          <span className="text-base font-semibold text-right text-muted-foreground">{tx.amount} AVAX</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-base font-medium">{tx.description}</p>
                          <p className="text-sm text-muted-foreground">{formattedDate}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Billing;
