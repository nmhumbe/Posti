import { Screen, ComingSoon } from "@ui/components";

export function PassportScreen() {
  return (
    <Screen title="Passport" kicker="Stamps collected">
      <ComingSoon note="Skeuomorphic passport spread (dark cover, diagonal-hatch pages) with rotated visa stamps — solid = collected, dashed = awaiting — and circular country stamps generated per visit (name, real entry date, per-continent motif, slight rotation). Prev/next page nav. 'Next stamp: <country> — NN%' progress card. (Phase 4)" />
    </Screen>
  );
}
