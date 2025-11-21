import {
  Case,
  Counselor,
  SessionNote,
  RiskLevel,
  CaseStatus,
  UserRole,
} from "@prisma/client";

export type CaseWithDetails = Case & {
  assignedTo?: Pick<Counselor, "id" | "fullName" | "email"> | null;
  sessionNotes?: (SessionNote & {
    counselor: Pick<Counselor, "fullName">;
  })[];
  _count?: {
    sessionNotes: number;
  };
};

export type { RiskLevel, CaseStatus, UserRole, Counselor, Case, SessionNote };
