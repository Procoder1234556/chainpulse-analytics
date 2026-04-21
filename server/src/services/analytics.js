let totalWalletAnalyses = 0;
let totalAlertsCreated = 0;

export function incrementWalletAnalyses() {
  totalWalletAnalyses++;
}

export function incrementAlertsCreated() {
  totalAlertsCreated++;
}

export function getAnalytics() {
  return {
    totalWalletAnalyses,
    totalAlertsCreated
  };
}
