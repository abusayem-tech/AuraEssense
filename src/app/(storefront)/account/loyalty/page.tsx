import { Sparkles } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatBDT, formatDate } from "@/lib/format";

export const metadata = { title: "Rewards" };

interface LoyaltyTx {
  id: string;
  points: number;
  reason: string | null;
  created_at: string;
}

export default async function LoyaltyPage() {
  const profile = await getProfile();
  const supabase = await createClient();
  const { data } = await supabase
    .from("loyalty_transactions")
    .select("*")
    .order("created_at", { ascending: false });
  const txns = (data as unknown as LoyaltyTx[]) ?? [];

  return (
    <div>
      <h2 className="mb-6 font-display text-2xl text-ivory">AuraEssence Rewards</h2>

      <div className="border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent p-8">
        <Sparkles className="text-gold" size={28} />
        <p className="mt-4 text-xs uppercase tracking-widest text-muted">
          Available Balance
        </p>
        <p className="mt-1 font-display text-5xl text-ivory tnum">
          {profile?.loyalty_points ?? 0}
          <span className="ml-2 text-lg text-muted">points</span>
        </p>
        <p className="mt-2 text-sm text-ivory-dim">
          Worth {formatBDT(profile?.loyalty_points ?? 0)} towards your next order ·
          Earn 2% back on every purchase.
        </p>
      </div>

      <h3 className="mb-4 mt-10 eyebrow">Activity</h3>
      {txns.length === 0 ? (
        <p className="border border-line p-8 text-center text-muted">
          No rewards activity yet. Earn points with your first purchase.
        </p>
      ) : (
        <ul className="divide-y divide-line border border-line">
          {txns.map((t) => (
            <li key={t.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-ivory">{t.reason}</p>
                <p className="text-xs text-muted">{formatDate(t.created_at)}</p>
              </div>
              <span
                className={`text-sm tnum ${t.points >= 0 ? "text-emerald" : "text-rose"}`}
              >
                {t.points >= 0 ? "+" : ""}
                {t.points}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
