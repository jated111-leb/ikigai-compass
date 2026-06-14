// ============================================================
// Mission Fit — Types
// ============================================================
// A two-sided process for purpose-driven teams:
//   1. The founder defines the company's mission ("the soul").
//   2. Each team member completes a mission-layer reflection.
//   3. An AI-generated Alignment Dossier powers a real conversation.
//
// Design principles encoded here:
//   - Only mission-layer material is ever captured in this flow.
//     Deeper personal material (shadow, fears) belongs to the
//     individual's private Ikigai Journey and is never asked here.
//   - Nothing a member writes is shared until they explicitly consent.
//   - The output is a conversation guide, never a score or verdict.

export interface CompanyProfile {
  companyName: string;
  founderName: string;
  /** questionId -> answer */
  responses: Record<string, string>;
  /** AI-synthesized "soul of the company"; null until generated */
  synthesis: string | null;
  updatedAt: string;
}

export interface MemberReflection {
  id: string;
  name: string;
  role: string;
  /** questionId -> answer */
  responses: Record<string, string>;
  /** The member has explicitly agreed to share this reflection. */
  consentShared: boolean;
  completedAt: string | null;
  updatedAt: string;
}

export interface Dossier {
  memberId: string;
  /** Markdown alignment dossier (no scores). */
  content: string;
  generatedAt: string;
}

export interface MissionFitState {
  company: CompanyProfile | null;
  members: MemberReflection[];
  /** memberId -> dossier */
  dossiers: Record<string, Dossier>;
}

/** Minimal company context handed to a member during reflection. */
export interface MissionInvite {
  companyName: string;
  founderName: string;
  mission: string;
  memberId: string;
  memberName: string;
  role: string;
}
