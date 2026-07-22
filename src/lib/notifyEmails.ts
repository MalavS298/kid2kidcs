import { supabase } from "@/integrations/supabase/client";

const BRAND_HEADER = `
  <div style="background:#4F46E5;padding:20px 24px;border-radius:12px 12px 0 0;">
    <h1 style="margin:0;color:#ffffff;font-family:Inter,Arial,sans-serif;font-size:18px;font-weight:600;">
      Kid2Kid CS
    </h1>
  </div>
`;

const wrap = (inner: string) => `
  <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
    ${BRAND_HEADER}
    <div style="padding:24px;color:#0f172a;line-height:1.55;font-size:15px;">
      ${inner}
      <p style="margin-top:24px;color:#64748b;font-size:13px;">— The Kid2Kid CS Team</p>
    </div>
  </div>
`;

async function send(to: string | string[], subject: string, html: string) {
  try {
    await supabase.functions.invoke("send-notification-email", {
      body: { to, subject, html: wrap(html) },
    });
  } catch (err) {
    console.error("Email send failed:", err);
  }
}

export const emailStudentApproved = (email: string, name: string) =>
  send(
    email,
    "Your Kid2Kid CS account has been approved 🎉",
    `<p>Hi ${name},</p>
     <p>Your account has been <strong>approved</strong> by Kid2Kid CS!</p>
     <p>You'll be paired up shortly with the next available volunteer. We'll email you again as soon as you're matched.</p>`
  );

export const emailVolunteerApproved = (email: string, name: string) =>
  send(
    email,
    "Your Kid2Kid CS volunteer account has been approved 🎉",
    `<p>Hi ${name},</p>
     <p>Your volunteer account has been <strong>approved</strong> by Kid2Kid CS!</p>
     <p>You'll be paired up shortly with the next available students. We'll email you again as soon as you're matched.</p>`
  );

export const emailStudentPaired = (email: string, studentName: string, teacherName: string) =>
  send(
    email,
    "You've been paired with your Kid2Kid CS volunteer!",
    `<p>Hi ${studentName},</p>
     <p>Great news — you've been paired with <strong>${teacherName}</strong>!</p>
     <p>You can now start chatting on the Kid2Kid CS website to figure out a time that works for both of you.</p>`
  );

export const emailVolunteerPaired = (email: string, teacherName: string, studentNames: string[]) =>
  send(
    email,
    "You've been paired with your Kid2Kid CS student!",
    `<p>Hi ${teacherName},</p>
     <p>You've been paired with <strong>${studentNames.join(", ")}</strong>.</p>
     <p>Hop into the Kid2Kid CS website to start a group chat and figure out a common time to meet.</p>`
   );

export const emailWestwoodStudentApproved = (email: string, name: string) =>
  send(
    email,
    "You're in — Westwood Robotics Python camp approved 🎉",
    `<p>Hi ${name},</p>
     <p>You have been <strong>approved</strong> for the Westwood Robotics Python camp with Kid2Kid CS!</p>
     <p>Head to your dashboard to join classes — meetings scheduled by your admin will show up there automatically.</p>
     <p><a href="https://kid2kidcs.lovable.app/login" style="display:inline-block;background:#F97316;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600;">Go to your dashboard</a></p>`
  );

const ADMIN_INBOX = "slingshotftc@gmail.com";

export const emailAdminNewSignup = (
  kind: "Student" | "Volunteer" | "Westwood Robotics Student",
  details: Record<string, string | number | undefined>
) => {
  const rows = Object.entries(details)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;color:#64748b;font-size:13px;">${k}</td><td style="padding:6px 12px;font-weight:500;">${v}</td></tr>`
    )
    .join("");
  return send(
    ADMIN_INBOX,
    `New ${kind} signup — Kid2Kid CS`,
    `<p>A new <strong>${kind}</strong> just signed up on Kid2Kid CS.</p>
     <table style="width:100%;border-collapse:collapse;margin-top:12px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
       ${rows}
     </table>
     <p style="margin-top:16px;">Review it in the admin dashboard.</p>`
  );
};
