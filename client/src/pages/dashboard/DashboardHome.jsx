import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, TrendingUp, Mail, Trophy, ChevronRight } from 'lucide-react';
import MedalIcon from '../../assets/icons/outline-medal.png';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { useDashboard } from '../../hooks/dashboard/useDashboard';

const ICON_MAP = { Users, Calendar, TrendingUp, Mail, Trophy };

const rankColor = (rank) => {
  if (rank === 1) return 'text-yellow-500';
  if (rank === 2) return 'text-gray-400';
  if (rank === 3) return 'text-orange-400';
  return 'text-muted';
};

const formStyles = {
  green: { bg: 'bg-green-50', badge: 'bg-green-500 text-white', label: 'text-green-700', sub: 'text-green-600' },
  red: { bg: 'bg-red-50', badge: 'bg-red-500 text-white', label: 'text-red-700', sub: 'text-red-600' },
};

function Skeleton() {
  const skeletonCard = (key, rows) => (
    <div key={key} className="bg-card-alt rounded-2xl shadow-sm p-5 md:p-6 animate-pulse">
      {rows}
    </div>
  );

  return (
    <div className="min-h-screen p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => skeletonCard(i, (
          <>
            <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700 mb-4" />
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </>
        )))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => skeletonCard(i, (
          <>
            <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
            <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-5" />
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </>
        )))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2].map((i) => skeletonCard(i, (
          <>
            <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
            <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-5" />
            {[1, 2, 3, 4, 5].map((j) => (
              <div key={j} className="flex items-center gap-3 py-2.5">
                <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1">
                  <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="h-6 w-14 bg-gray-200 dark:bg-gray-700 rounded-full" />
              </div>
            ))}
          </>
        )))}
      </div>
    </div>
  );
}

const totalBackground = (arr) => arr.reduce((s, e) => s + e.value, 0);

export default function Dashboard() {
  const { data, loading, error } = useDashboard();

  if (loading) return <Skeleton />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-card-alt rounded-2xl shadow-sm p-8 text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-xl font-bold">!</span>
          </div>
          <p className="text-foreground font-semibold text-lg mb-1">Something went wrong</p>
          <p className="text-muted text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-4">

      {/* Row 1 — Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.statsCards.map((card) => {
          const Icon = ICON_MAP[card.icon];
          return (
            <div
              key={card.id}
              className="bg-card-alt rounded-2xl shadow-sm p-5 md:p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10">
                  {Icon && <Icon size={18} className="text-primary" />}
                </div>
                {card.badge && (
                  <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                    {card.badge}
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-foreground">{card.value}</p>
              <p className="text-sm font-medium text-foreground">{card.label}</p>
              <p className="text-xs text-muted mt-0.5">{card.sub}</p>
            </div>
          );
        })}
      </section>

      {/* Row 2 — Charts + Form Status */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Panel: Academic Background */}
        <div className="bg-card-alt rounded-2xl shadow-sm p-5 md:p-6 overflow-hidden lg:col-span-1">
          <h3 className="text-foreground font-semibold text-sm">Academic Background</h3>
          <p className="text-muted text-xs mb-4">Distribution by college</p>

          <div className="[&_*]:outline-none">
            <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data.academicBackgroundData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
              >
                {data.academicBackgroundData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-2">
            {data.academicBackgroundData.map((entry) => {
              const pct = ((entry.value / totalBackground(data.academicBackgroundData)) * 100).toFixed(0);
              return (
                <div key={entry.name} className="flex items-center gap-2 text-sm">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="flex-1 text-foreground">{entry.name}</span>
                  <span className="font-bold text-foreground">{pct}%</span>
                </div>
              );
            })}
          </div>
				</div>
        
        {/* Panel: Academic Year Split */}
        <div className="flex flex-col bg-card-alt rounded-2xl shadow-sm p-5 md:p-6 overflow-hidden lg:col-span-1">
          <h3 className="text-foreground font-semibold text-sm">Academic Year Split</h3>
          <p className="text-muted text-xs mb-4">Students per study year</p>

          <div className="flex-1 w-full min-h-[220px] [&_*]:outline-none">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.academicYearData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <Tooltip />
                <Bar dataKey="students" radius={[4, 4, 0, 0]} fill="var(--color-primary)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Panel: Form Status Summary */}
        <div className="flex flex-col justify-between bg-card-alt rounded-2xl shadow-sm p-5 md:p-6 overflow-hidden lg:col-span-1">
					<div>
						<div>
	      			<h3 className="text-foreground font-semibold text-sm">Form Status Summary</h3>
								<p className="text-muted text-xs mb-4">{data.formStatusData[0]?.total ?? "—"} total forms tracked</p>
						</div>
	
	          <div className="space-y-3">
	            {data.formStatusData.map((item) => {
	              const s = formStyles[item.colorClass];
	              return (
	                <div key={item.status} className={`${s.bg} rounded-xl p-4 flex items-center gap-3`}>
	                  <div className={`${s.badge} w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0`}>
	                    {item.count}
	                  </div>
	                  <div>
	                    <p className={`${s.label} font-semibold text-sm`}>{item.status}</p>
	                    <p className={`${s.sub} text-xs`}>{item.count} forms {item.status.toLowerCase()}</p>
	                  </div>
	                </div>
	              );
	            })}
	          </div>
					</div>

          <div className="mt-5">
						<div className='flex justify-between items-center mb-2'>
							<p className="text-foreground text-xs font-semibold">Open vs Closed</p>
							<p className="text-xs text-muted">
	              {Math.round((data.formStatusData.find((f) => f.status === 'Open').count / data.formStatusData.find((f) => f.status === 'Open').total) * 100)}% open
	            </p>
						</div>
            <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 flex overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-l-full transition-all"
                style={{ width: `${(data.formStatusData.find((f) => f.status === 'Open').count / data.formStatusData.find((f) => f.status === 'Open').total) * 100}%` }}
              />
              <div
                className="h-full bg-red-500 rounded-r-full transition-all"
                style={{ width: `${(data.formStatusData.find((f) => f.status === 'Closed').count / data.formStatusData.find((f) => f.status === 'Closed').total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Row 3 — Members + Signups */}
      <sectionChevronRight className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Panel: Top Active Members */}
        <div className="bg-card-alt rounded-2xl shadow-sm p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-foreground font-semibold text-sm">Top Active Members</h3>
              <p className="text-muted text-xs">Highest QR scan counts</p>
            </div>
            <img src={MedalIcon} alt="medal" />
          </div>

					<div className='flex flex-col gap-0 md:gap-4 overflow-hidden'>
			      {data.topMembers.map((member) => (
	            <div
	              key={member.rank}
	              className="flex items-center gap-3 py-2.5"
	            >
	              <span className={`w-5 text-center text-sm font-bold ${rankColor(member.rank)}`}>
	                {member.rank}
	              </span>
	              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white ${member.avatarColor}`}>
	                {member.initials}
	              </div>
	              <div className="flex-1 min-w-0">
	                <p className="font-medium text-sm text-foreground truncate">{member.name}</p>
	                <p className="text-xs text-muted truncate">{member.college}</p>
	              </div>
	              <span className="ml-auto bg-primary-dark text-white text-xs px-3 py-1 rounded-full font-medium shrink-0">
	                {member.scans} scans
	              </span>
	            </div>
						))}
					</div>
        </div>

        {/* Panel: Latest Signups */}
        <div className="flex flex-col bg-card-alt rounded-2xl shadow-sm p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-foreground font-semibold text-sm">Latest Signups</h3>
              <p className="text-muted text-xs">Recently registered members</p>
            </div>
            <span className="text-xs px-3 py-1 font-medium rounded-full bg-primary/10 text-primary dark:text-primary-dark">Live</span>
          </div>

          <div className="flex-1">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-xs font-semibold text-muted uppercase tracking-wide">
                  <th className="text-left font-semibold pb-2">NAME</th>
                  <th className="text-left font-semibold pb-2">COLLEGE</th>
                  <th className="text-right font-semibold pb-2">REGISTERED</th>
                </tr>
              </thead>
              <tbody>
                {data.latestSignups.map((signup, idx) => (
                  <tr key={idx} className='*:py-2.5'>
                    <td className="flex items-center gap-3 font-medium text-sm text-foreground whitespace-nowrap">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white ${signup.avatarColor}`}>
                        {signup.initials}
                      </div>
                      {signup.name}
                    </td>
                    <td className="text-sm text-muted whitespace-nowrap">{signup.college}</td>
                    <td className="text-xs text-muted text-right whitespace-nowrap">{signup.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Link
            to="/dashboard/users"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline mt-auto pt-3"
          >
            View all members <ChevronRight />
          </Link>
        </div>
      </sectionChevronRight>
    </div>
  );
}
