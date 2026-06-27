import * as mock from '../../data/dashboardData';

export function useDashboard() {
  // TODO: replace `data` with API responses from:
  //  GET /api/stats         → statsCards
  //   GET /api/colleges      → academicBackgroundData
  //   GET /api/year-split    → academicYearData
  //   GET /api/forms/status  → formStatusData
  //   GET /api/members/top   → topMembers
  //   GET /api/signups/latest → latestSignups
  const data = {
    statsCards: mock.statsCards,
    academicBackgroundData: mock.academicBackgroundData,
    academicYearData: mock.academicYearData,
    formStatusData: mock.formStatusData,
    topMembers: mock.topMembers,
    latestSignups: mock.latestSignups,
  };

  return {
    data,
    loading: false, // TODO: set to true while awaiting API responses
    error: null,// TODO: capture  errors here
  };
}
