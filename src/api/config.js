// Which features still use mock data because Team B has not shipped the
// endpoint yet. Flip a flag to false once the real endpoint is live; the
// request/response shapes match the contract we sent Team B, so pages do not
// need to change.
//
//   auth  -> POST /auth/login           (mock: looks the email up in GET /users)
//   terms -> GET  /terms                (mock: fixed list below in termAPI.js)
//   plans -> /plans CRUD                (mock: stored in this browser's localStorage)
export const MOCK = {
  auth: true,
  terms: true,
  plans: true,
};

// Team A's demo accounts (all mock data). Shown on the login page only while
// login is mocked, so testers can pick an account quickly.
export const DEMO_ACCOUNTS = [
  { email: "BobMan@gmail.com", label: "Bob Man", role: "Student" },
  { email: "rachel.green@example.com", label: "Rachel Green", role: "Student" },
  { email: "joey.tribbiani@example.com", label: "Joey Tribbiani", role: "Transfer student" },
  { email: "ross.geller@example.com", label: "Ross Geller", role: "Counselor" },
  { email: "monica.geller@example.com", label: "Monica Geller", role: "Admin" },
];
