export const CHALLENGE_CONFIG = {
  title: "SCULPT SERIES: Glutes & Core Edition",
  maxParticipants: 12,
  kickoff: {
    startDate: "30 March 2026",
    time: "16:30 - 17:30",
    location: "72 Kleinenberg Street, Old Bendor, Polokwane",
  },
  discount: {
    code: "FIRST5",
    percent: 20,
    maxUses: 5,
  },
  pricing: {
    member: 1300,
    nonMember: 1500,
  },
} as const;

export type ChallengePaymentOption = "member" | "non_member";
export type ChallengeGoal = "lose_body_fat" | "maintain" | "build_muscle";
export type ChallengeActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "heavily_active";
export type ChallengeDietaryPreference =
  | "vegan"
  | "vegetarian"
  | "pescatarian";

export const PAYMENT_OPTION_LABELS: Record<ChallengePaymentOption, string> = {
  member: `Current member (R${CHALLENGE_CONFIG.pricing.member})`,
  non_member: `Non-member (R${CHALLENGE_CONFIG.pricing.nonMember})`,
};

export const GOAL_LABELS: Record<ChallengeGoal, string> = {
  lose_body_fat: "Lose body fat",
  maintain: "Maintain",
  build_muscle: "Build muscle",
};

export const ACTIVITY_LABELS: Record<ChallengeActivityLevel, string> = {
  sedentary: "Sedentary - Spend most of the day sitting",
  lightly_active: "Lightly active - Spend a good part of the day on your feet",
  heavily_active:
    "Heavily active - Spend most of the day doing heavy physical activity",
};

export const DIETARY_LABELS: Record<ChallengeDietaryPreference, string> = {
  vegan: "Vegan",
  vegetarian: "Vegetarian",
  pescatarian: "Pescatarian",
};

export const GOAL_OPTIONS = Object.keys(GOAL_LABELS) as ChallengeGoal[];
export const ACTIVITY_OPTIONS = Object.keys(
  ACTIVITY_LABELS
) as ChallengeActivityLevel[];
export const DIETARY_OPTIONS = Object.keys(
  DIETARY_LABELS
) as ChallengeDietaryPreference[];

export const CHALLENGE_FULL_TERMS_TEXT = `6 WEEK CHALLENGE TERMS AND CONDITIONS & ACCESS - PLEASE REVIEW, READ AND SIGN.

Challenge Agreement Terms
Date:
This Challenge agreement is between RECOUPYOU Pty Ltd (RECOUPYOU GYM) and You.

This Agreement is intended:
a) to set out the terms of RECOUPYOU GYM's SCULPT SERIES: Glutes & Core Edition (the Challenge); and
b) to protect the intellectual property of RECOUPYOU made available to you during the Challenge.

In this agreement unless the contrary intention appears:
"GYM" means RECOUPYOU GYM at 72 KLEINENBERG STREET, OLD BENDOR, POLOKWANE.
"Members" means all members of the GYM including all participants in the Challenge.

It is agreed as follows:
RECOUPYOU GYM will provide to you:
1. Full access to the GYM between 04:20PM - 05:40PM Monday, Tuesday and Thursday for 6 weeks starting on the commencement date of the challenge (NON-MEMBERS). Full access to the GYM between 5:00am-7:00pm Monday to Friday and 6:00am-12:00pm on Saturdays (MEMBERS).
2. Custom eating plan tailored to your goals.
3. Pre-wellness evaluation meeting to cover the basics of nutrition for your specific goal of the Challenge.
4. Midway mindset and progress check-in to help encourage and motivate you at the halfway mark of the Challenge. The meeting will be held in the gym or via video call.
5. Post-wellness evaluation meeting to teach you how to maintain your results after the Challenge and set new goals. The meeting will be held in the gym or via video call at a specified date in week 5.
6. Weekly evaluations including but not limited to:
   a) Photos - taken only on day 1, halfway through the challenge and final day.
   b) Measurements - optional.
   c) Weight - optional.
7. Break-up celebrations at the gym (about 30 minutes to 1 hour) including but not limited to:
   a) Some eats.
   b) Non-alcoholic drinks.
   c) Top 2 prizes.

Your obligations:
8. You must comply with all Workplace Health and Safety Legislation directions given to you or obligations imposed on you.
9. You release RECOUPYOU GYM, its servants, agents and contractors from any legal claims, suits and demands for minor injury, serious injury or death arising directly or indirectly from participation in the Challenge.
10. You assume all risk for personal injury suffered during the Challenge.
11. You must keep information, data, techniques and documents given or imparted to you during the Challenge confidential.
12. You must not divulge to any third party any sensitive or confidential information, data, techniques and demands concerning the activities or intellectual property of RECOUPYOU GYM.

Behaviour expectations:
13. To assist us in maintaining a safe and comfortable environment for all members and staff, the following conditions apply:
   a) Entry will be refused or you may be requested to leave the GYM if:
      i. You are using abusive or threatening language or behaving in a threatening way.
      ii. You are under the influence of drugs or alcohol.
   b) The club is a non-smoking facility.
   c) Fully enclosed, clean sports shoes are encouraged to be worn during workouts for safety reasons, but not compelled. Members can wear sports bras, crop tops or t-shirts at all times in the GYM. Clothing must be clean and tidy with no offensive prints or designs.

Your obligation in relation to your health:
14. On the day you enter into this agreement and each time you use the GYM, you promise that:
   a) you are in good physical condition
   b) you have disclosed any condition that may cause a health risk to you if you undertake any exercise or program in the club or use equipment
   c) you know of no medical or other reason why you cannot or should not do active or passive exercise.
15. Our staff and contractors are not medically trained. They are not qualified to assess the exact state of your physical condition, your prior medical history, or whether you can exercise without risking your health, safety or comfort levels. If you have any doubts, it is your responsibility to seek medical advice before starting an exercise or training program.
16. Undertaking training and exercise activities in the GYM does carry risk and may impact your health. This risk is assumed by you. RECOUPYOU GYM will not be responsible and you release RECOUPYOU GYM from liability if you are injured or suffer an adverse medical condition while exercising, training or undertaking similar activities.
17. RECOUPYOU GYM reserves the right to require a medical certificate before you undertake certain training.

Valuables:
18. You are responsible for your personal items. RECOUPYOU GYM employees, agents or contractors are not responsible for any loss of personal property. Valuables should be kept with you or left at home.

Lost property:
19. Any lost clothing items will be held for two weeks and then donated to charity.

Reservations to RECOUPYOU GYM:
20. RECOUPYOU GYM reserves the right to make changes to exercise equipment supplied in the GYM at any time.
21. RECOUPYOU GYM also reserves the right to make changes at any time (for example, alter class type and instructors).

Booking system:
22. You must notify RECOUPYOU GYM if you are unable to attend class at least one hour before class starts.
23. If you do not give notice as per paragraph 22 on two occasions in one week, you may not attend class for three (3) days from the date of the missed class.
24. If you do not give notice as per paragraph 22 on three occasions in two weeks, you may not attend class for seven (7) days from the date of the missed class.
25. If RECOUPYOU GYM imposes these limitations, you are not entitled to any refund of fees or compensation.

Suspension for unforeseen circumstances:
26. If the GYM becomes inaccessible due to events beyond the control of RECOUPYOU GYM, including load shedding, fire, flood, pandemic, infectious disease, government lockdown, or act of God, the Challenge will be suspended automatically from the date of inaccessibility until access is restored. No refund applies for this period.

27. If you are under 18 years of age, this agreement must be executed on your behalf by your parent or guardian.

Payment:
28. You agree to pay for services under this agreement using Method A (Member) or Method B (Non-Member).
29. You will select your payment method at the conclusion of this document.
30. You agree to pay the amount stated for your selected method.
31. Payments are non-refundable, non-transferable and non-exchangeable.

Method A - Member (R1300): because I am a current member.
Method B - Non-Member (R1500): because I am not currently a member.
I understand that none of these payment methods are refundable.

Please continue for the next part of your challenge contract:
T&C's for access

RECOUPYOU STUDIO Pty LTD Membership Agreement -
6 WEEK CHALLENGE - LIMITED ACCESS FOR NON-MEMBERS AND FULL ACCESS FOR MEMBERS.

Gym Address: 72 Kleinenberg Street, Old Bendor, Polokwane.

IMPORTANT NOTICE
This agreement outlines your rights and responsibilities as a member of RECOUPYOU Pty LTD. It includes attached terms and referenced documents such as club rules and privacy policy. Please read carefully before signing, as it is legally binding.

Electronic communication:
By signing this agreement, you consent to receiving all notices, communications and this agreement electronically in compliance with the Electronic Communications and Transactions (ECT) Act 25 of 2002. Electronic communication has the same legal effect as written communication. Members must keep their contact details up to date.

1. ACCESS & SECURITY
- Member access is not transferable.
- Security cameras operate in common areas and members consent to recording.
- Members may not enter the kitchen or any other restricted room without permission.

2. MEMBER RESPONSIBILITIES & CODE OF CONDUCT
- No guests policy: only registered members may access the gym.
- Proper use of equipment: members must use equipment safely and return weights.
- Cleanliness and hygiene: members must wipe down equipment and bring a towel.
- Noise restrictions: noise levels must be kept to a minimum.
- Substance policy: alcohol, drugs and performance-enhancing substances are strictly prohibited.

3. HEALTH & SAFETY WAIVERS
- Liability waiver: gym use is at your own risk. RECOUPYOU Pty LTD and its officers, employees, contractors and agents are not liable for injury, loss or damage except where required by law.
- Acknowledgment of risk: members acknowledge that the gym is an unsupervised facility and that physical activity carries inherent risks, including serious injury or death.
- Indemnity clause: members indemnify RECOUPYOU Pty LTD from claims, damages or liabilities arising from gym use, including third-party claims.
- Emergency medical consent: in an emergency, staff may contact emergency services on behalf of the member. Members release RECOUPYOU Pty LTD from liability related to emergency treatment.
- Statutory compliance: nothing excludes rights under the Consumer Protection Act, including guarantees that services are provided with due care and skill.

4. LIABILITY & INDEMNIFICATION
- Member assumption of risk: members assume all risks associated with gym use, including injury, property damage, equipment malfunction or unforeseen hazards.
- Waiver of claims: members waive, release and discharge RECOUPYOU Pty LTD and its employees, officers and contractors from liability for injury, death, disability, property damage or financial loss, except where prohibited by law.
- Equipment use liability: members are responsible for inspecting equipment before use and reporting faults immediately.
- Legal costs and indemnification: members indemnify RECOUPYOU Pty LTD against claims, actions and legal fees resulting from member actions or negligence.
- Third-party liability: RECOUPYOU Pty LTD is not liable for injuries caused by other members.

5. PROPERTY DAMAGE & THEFT
- Members are financially responsible for damage they cause to gym property, equipment or fixtures.
- RECOUPYOU Pty LTD is not responsible for lost, stolen or damaged personal property.
- Members must not bring weapons, hazardous substances or illegal drugs onto the premises.

6. EMERGENCY SITUATIONS & MEDICAL EVENTS
- No staff obligation to assist: RECOUPYOU Pty LTD does not provide on-site medical supervision.
- Medical release: staff are not required to provide first aid. Any assistance is voluntary and does not create liability.
- Medical declaration: members are responsible for ensuring they are medically fit to exercise.

7. LEGAL COMPLIANCE & DISPUTES
- Governing law: laws of South Africa.
- Dispute resolution: members agree to attempt mediation before legal action. Disputes must be resolved through binding arbitration rather than court proceedings.
- Amendments and policy changes: RECOUPYOU Pty LTD may update terms and policies with reasonable notice.

By signing below, you confirm that you have read and agree to the terms of this agreement.
By signing this, you agree to the 6-week challenge agreement and the terms and conditions for both challenge and access to the gym.`;

export function getBaseChallengeAmount(
  paymentOption: ChallengePaymentOption
): number {
  return paymentOption === "member"
    ? CHALLENGE_CONFIG.pricing.member
    : CHALLENGE_CONFIG.pricing.nonMember;
}

export function getDiscountedAmount(baseAmount: number): number {
  const discountValue = Math.round(
    baseAmount * (CHALLENGE_CONFIG.discount.percent / 100)
  );
  return Math.max(0, baseAmount - discountValue);
}

export function getDiscountValue(baseAmount: number): number {
  return Math.max(0, baseAmount - getDiscountedAmount(baseAmount));
}

export function normalizePromoCode(code: string): string {
  return code.trim().toUpperCase();
}
