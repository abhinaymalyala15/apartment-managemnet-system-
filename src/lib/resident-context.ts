import {
  getResident,
  getFlatById,
  getBlockById,
  getPrimaryOwner,
  getFamilyByFlat,
  getPaymentsByFlat,
  getNotices,
  getServices,
  getTenantsByFlat,
} from "@/lib/data";

export function getResidentContext() {
  const resident = getResident();
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
