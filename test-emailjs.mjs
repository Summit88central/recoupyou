import { config } from "dotenv";
config({ path: ".env.local" });
import { sendMembershipEmail } from "./lib/emailjs.ts";

// wait, lib/emailjs.ts is a TS file and uses environment variables.
// we can use ts-node or just check the template ID.
