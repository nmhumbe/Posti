import SwiftUI

/// Tab 3 — Passport (aesthetic only). Artboards 1a + 1d: dark-cover spread,
/// diagonal-hatch pages, rotated visa stamps (solid = collected, dashed =
/// awaiting) and circular country stamps. Phase 4.
struct PassportScreen: View {
    var body: some View {
        ScreenScaffold(title: "Passport", kicker: "Stamps collected") {
            ComingSoon(note: "PassportSpread: accent-900 cover, two hatch-textured pages, VisaStamp + circular Stamp components generated per country (name, real entry date, per-continent motif, slight rotation). Prev/next page nav. \"Next stamp: <country> — NN%\" progress card.")
        }
    }
}

#Preview { PassportScreen() }
