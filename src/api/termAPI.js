import { apiGet } from "./client";
import { MOCK } from "./config";

// Mock terms. Ids 4, 1 and 3 are the ones Team A's course history already
// uses (matched against their user-profiles PDF). Ids 901+ are made-up future
// terms for planning and will be replaced by GET /terms.
const MOCK_TERMS = [
  { term_id: 4, term_name: "Spring 2026", start_date: "2026-01-20" },
  { term_id: 1, term_name: "Summer 2026", start_date: "2026-06-01" },
  { term_id: 3, term_name: "Fall 2026", start_date: "2026-08-31" },
  { term_id: 901, term_name: "Spring 2027", start_date: "2027-01-25" },
  { term_id: 902, term_name: "Summer 2027", start_date: "2027-06-01" },
  { term_id: 903, term_name: "Fall 2027", start_date: "2027-08-30" },
  { term_id: 904, term_name: "Spring 2028", start_date: "2028-01-24" },
  { term_id: 905, term_name: "Summer 2028", start_date: "2028-06-01" },
  { term_id: 906, term_name: "Fall 2028", start_date: "2028-08-28" },
  { term_id: 907, term_name: "Spring 2029", start_date: "2029-01-22" },
  { term_id: 908, term_name: "Fall 2029", start_date: "2029-08-27" },
  { term_id: 909, term_name: "Spring 2030", start_date: "2030-01-21" },
];

let termsRequest;

// GET /terms -> [{ term_id, term_name, start_date, end_date? }], oldest first
export function getTerms() {
  if (!termsRequest) {
    termsRequest = (MOCK.terms ? Promise.resolve(MOCK_TERMS) : apiGet("/terms"))
      .then((terms) =>
        [...terms].sort((a, b) =>
          String(a.start_date ?? "").localeCompare(String(b.start_date ?? ""))
        )
      )
      .catch((error) => {
        termsRequest = undefined;
        throw error;
      });
  }
  return termsRequest;
}

// Terms that have not started yet: the ones a student can plan.
export async function getPlanningTerms(today = new Date()) {
  const terms = await getTerms();
  const now = today.toISOString().slice(0, 10);
  return terms.filter((term) => String(term.start_date ?? "") > now);
}
