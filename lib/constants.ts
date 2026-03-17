export const COMPANIES = [
  { name_en: "PTT", name_th: "ปตท", slug: "ptt", column: 1 },
  { name_en: "Bangchak", name_th: "บางจาก", slug: "bangchak", column: 2 },
  { name_en: "Shell", name_th: "เชลล์", slug: "shell", column: 3 },
  { name_en: "Esso", name_th: "เอสโซ่", slug: "esso", column: 4 },
  { name_en: "Chevron", name_th: "เชฟรอน", slug: "chevron", column: 5 },
  { name_en: "IRPC", name_th: "ไออาร์พีซี", slug: "irpc", column: 6 },
  { name_en: "PTG Energy", name_th: "พีทีจี เอ็นเนอยี", slug: "ptg-energy", column: 7 },
  { name_en: "Susco", name_th: "ซัสโก้", slug: "susco", column: 8 },
  { name_en: "Pure", name_th: "เพียว", slug: "pure", column: 9 },
  { name_en: "SUSCO Dealers", name_th: "ซัสโก้ ดีลเลอร์", slug: "susco-dealers", column: 10 },
] as const;

export const FUEL_TYPES = [
  { name_en: "Gasohol 95-E10", name_th: "แก๊สโซฮอล์ ออกเทน 95", category: "gasohol", row: 13 },
  { name_en: "Gasohol 95-E20", name_th: "แก๊สโซฮอล์ E20", category: "gasohol", row: 14 },
  { name_en: "Gasohol 95-E85", name_th: "แก๊สโซฮอล์ E85", category: "gasohol", row: 15 },
  { name_en: "Gasohol 91-E10", name_th: "แก๊สโซฮอล์ ออกเทน 91", category: "gasohol", row: 16 },
  { name_en: "Gasohol 95 Premium", name_th: "แก๊สโซฮอล์ ออกเทน 95 พรีเมียม", category: "gasohol", row: 17 },
  { name_en: "ULG 95 RON", name_th: "เบนซิน ออกเทน 95", category: "benzene", row: 18 },
  { name_en: "Benzene 95 Premium", name_th: "เบนซิน ออกเทน 95 พรีเมียม", category: "benzene", row: 19 },
  { name_en: "Diesel B7", name_th: "ดีเซลหมุนเร็ว บี7", category: "diesel", row: 20 },
  { name_en: "Diesel B10", name_th: "ดีเซลหมุนเร็ว บี10", category: "diesel", row: 21 },
  { name_en: "Diesel B20", name_th: "ดีเซลหมุนเร็ว บี20", category: "diesel", row: 22 },
  { name_en: "Premium Diesel", name_th: "ดีเซลหมุนเร็ว พรีเมียม", category: "diesel", row: 23 },
] as const;

export const COMPANY_COLORS: Record<string, string> = {
  ptt: "#1E40AF",
  bangchak: "#059669",
  shell: "#DC2626",
  esso: "#D97706",
  chevron: "#7C3AED",
  irpc: "#0891B2",
  "ptg-energy": "#DB2777",
  susco: "#65A30D",
  pure: "#EA580C",
  "susco-dealers": "#4B5563",
};

export const SIGNIFICANT_CHANGE_THRESHOLD = 0.5; // baht
