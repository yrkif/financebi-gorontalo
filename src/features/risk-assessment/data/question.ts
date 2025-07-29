import type { RiskQuestion, RiskProfile } from '@/types';

export const riskQuestions: Record<number, RiskQuestion> = {
  1: {
    title: 'Kepribadian Finansial Anda',
    question: 'Ketika merencanakan liburan akhir pekan, Anda lebih suka:',
    options: [
      { text: 'Itinerary detail dari pagi sampai malam', score: 1 },
      { text: 'Rencana umum, sisanya spontan', score: 3 },
      { text: 'Berangkat tanpa rencana, ikuti mood', score: 5 },
    ],
  },
  2: {
    title: 'Skenario Investasi Realistis',
    question:
      'Anda punya bonus Rp 10 juta. Teman menawarkan bisnis yang bisa untung 100% dalam 6 bulan, tapi bisa rugi total. Reaksi pertama:',
    options: [
      { text: 'Terlalu berisiko, lebih baik deposito saja', score: 1 },
      { text: 'Menarik, tapi perlu riset mendalam dulu', score: 3 },
      { text: 'Peluang bagus! Siap ambil risiko', score: 5 },
    ],
  },
  3: {
    title: 'Simulasi Pasar Keuangan',
    question:
      'Investasi Anda turun 20% dalam sebulan karena kondisi pasar. Yang Anda lakukan:',
    options: [
      { text: 'Jual segera sebelum rugi lebih besar', score: 1 },
      { text: 'Tahan, analisis penyebab turunnya', score: 3 },
      { text: 'Beli lebih banyak, harga lagi murah', score: 5 },
    ],
  },
  4: {
    title: 'Gaya Hidup & Preferensi',
    question: 'Proyek weekend ideal Anda:',
    options: [
      { text: 'Mengatur ulang laporan keuangan keluarga', score: 1 },
      { text: 'Belajar skill baru dari YouTube', score: 3 },
      { text: 'Coba olahraga ekstrem yang belum pernah', score: 5 },
    ],
  },
  5: {
    title: 'Pemikiran Jangka Panjang',
    question: "Definisi 'investasi jangka panjang' menurut Anda:",
    options: [
      { text: '5-10 tahun, fokus preservasi modal', score: 1 },
      { text: '10-20 tahun, balance growth dan safety', score: 3 },
      { text: '20+ tahun, maksimalkan potensi return', score: 5 },
    ],
  },
};

export const riskProfiles: Record<string, RiskProfile> = {
  conservative_saver: {
    type: 'Conservative Saver',
    description: 'Pengaman Dana - Prioritas Keamanan',
    characteristics: [
      'Mengutamakan keamanan modal',
      'Tidak suka volatilitas',
      'Fokus pada produk guaranteed return',
    ],
    recommendation: 'Deposito, obligasi pemerintah, reksa dana pasar uang',
    color: 'text-green-600',
    icon: '🛡️',
  },
  balanced_investor: {
    type: 'Balanced Investor',
    description: 'Penyeimbang Bijak - Moderat & Stabil',
    characteristics: [
      'Seimbang antara return dan risiko',
      'Bisa terima fluktuasi terbatas',
      'Investasi jangka menengah',
    ],
    recommendation: 'Reksa dana campuran, obligasi korporat, SBN',
    color: 'text-blue-600',
    icon: '⚖️',
  },
  growth_seeker: {
    type: 'Growth Seeker',
    description: 'Pemburu Pertumbuhan - Optimis & Aktif',
    characteristics: [
      'Target return tinggi',
      'Bisa tahan volatile jangka pendek',
      'Investasi jangka panjang',
    ],
    recommendation: 'Reksa dana saham, ETF, saham blue chip',
    color: 'text-purple-600',
    icon: '📈',
  },
  aggressive_trader: {
    type: 'Aggressive Trader',
    description: 'Petarung Pasar - Berani & Dinamis',
    characteristics: [
      'Sangat aggressive untuk return maksimal',
      'Nyaman dengan high volatility',
      'Active trading',
    ],
    recommendation: 'Saham growth, cryptocurrency, commodities',
    color: 'text-red-600',
    icon: '🚀',
  },
};

export function calculateRiskProfile(totalScore: number): RiskProfile {
  if (totalScore <= 8) return riskProfiles.conservative_saver;
  if (totalScore <= 15) return riskProfiles.balanced_investor;
  if (totalScore <= 20) return riskProfiles.growth_seeker;
  return riskProfiles.aggressive_trader;
}

export function getRiskProfileKey(totalScore: number): string {
  if (totalScore <= 8) return 'conservative_saver';
  if (totalScore <= 15) return 'balanced_investor';
  if (totalScore <= 20) return 'growth_seeker';
  return 'aggressive_trader';
}
