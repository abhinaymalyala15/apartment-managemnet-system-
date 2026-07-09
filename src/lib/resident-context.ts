import type { ResidentAuthUser } from "@/lib/auth/types";
import {
  getResident,
  getResidentById,
  getFlatById,
  getBlockById,
  getPrimaryOwner,
  getFamilyByFlat,
  getPaymentsByFlat,
  getNotices,
  getServices,
  getTenantsByFlat,
} from "@/lib/data";
import type { Resident } from "@/types";

function resolveResident(user?: ResidentAuthUser | null): Resident {
  if (user) {
    const fromData = getResidentById(user.id);
    if (fromData) return fromData;
    if (user.flatId) {
      return {
        id: user.id,
        apartmentId: user.apartmentId ?? "apt-sylvan-shelter",
        flatId: user.flatId,
        fullName: user.fullName,
        email: user.email,
        phone: user.mobile,
        role: "resident",
      };
    }
  }
  return getResident();
}

export function buildResidentContext(user?: ResidentAuthUser | null) {
  const resident = resolveResident(user);
  const flat = getFlatById(resident.flatId)!;
  const block = getBlockById(flat.blockId)!;

  return {
    resident,
    flat,
    block,
    owner: getPrimaryOwner(flat.id),
    family: getFamilyByFlat(flat.id),
    tenants: getTenantsByFlat(flat.id),
    payments: getPaymentsByFlat(flat.id),
    notices: getNotices(),
    services: getServices(flat.id),
  };
}

/** Server-side fallback — uses demo resident when no session is available. */
export function getResidentContext() {
  return buildResidentContext();
}

export type ResidentPortalContext = ReturnType<typeof buildResidentContext>;
