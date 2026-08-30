import SwiftUI

/// Swift port of `design/organic-styles.css` — the single source of truth for
/// the app's visual language. Values are copied verbatim from the imported
/// Claude Design token set; see PLAN.md §6.
enum Theme {

    // MARK: Colour

    enum Color {
        static let bg      = hex(0xF5EAD8)
        static let surface = hex(0xEBDDC5)
        static let text    = hex(0x201E1D)
        static let divider = Theme.Color.text.opacity(0.16)

        // Accent — terracotta
        static let accent     = hex(0xC67139)
        static let accent100  = hex(0xFFF2EB)
        static let accent200  = hex(0xFFE1D0)
        static let accent300  = hex(0xFFC6A5)
        static let accent400  = hex(0xF6A06B)
        static let accent500  = hex(0xD67F48)
        static let accent600  = hex(0xB2622D)
        static let accent700  = hex(0x8C491A)
        static let accent800  = hex(0x643312)
        static let accent900  = hex(0x402310)

        // Accent 2 — sage
        static let accent2    = hex(0x7A8A5E)
        static let accent2_100 = hex(0xF0FAE1)
        static let accent2_200 = hex(0xE1EECC)
        static let accent2_300 = hex(0xCCDBB2)
        static let accent2_400 = hex(0xAEBF92)
        static let accent2_500 = hex(0x8FA073)
        static let accent2_600 = hex(0x728157)
        static let accent2_700 = hex(0x56633F)
        static let accent2_800 = hex(0x3D472B)
        static let accent2_900 = hex(0x272E1B)

        // Neutral — warm grey
        static let neutral100 = hex(0xF9F4ED)
        static let neutral200 = hex(0xEEE7DB)
        static let neutral300 = hex(0xDCD3C4)
        static let neutral400 = hex(0xC0B6A5)
        static let neutral500 = hex(0xA19786)
        static let neutral600 = hex(0x82796A)
        static let neutral700 = hex(0x645C50)
        static let neutral800 = hex(0x474238)
        static let neutral900 = hex(0x2E2B25)

        static func fill(for choice: MapFill) -> SwiftUI.Color {
            switch choice {
            case .terracotta: return accent
            case .sage:       return accent2
            case .rust:       return accent700
            case .clay:       return accent600
            }
        }

        static func hex(_ value: UInt) -> SwiftUI.Color {
            SwiftUI.Color(
                red:   Double((value >> 16) & 0xFF) / 255,
                green: Double((value >> 8) & 0xFF) / 255,
                blue:  Double(value & 0xFF) / 255
            )
        }
    }

    // MARK: Type
    //
    // Heading: Caprasimo 400. Body: Figtree 400/600/700.
    // TTFs are not in the repo yet — `Font.custom` falls back to system until
    // they're added to Sources/Resources/Fonts/ and listed in project.yml.

    enum Typeface {
        static let heading = "Caprasimo"
        static let body    = "Figtree"
    }

    enum Font {
        static func heading(_ size: CGFloat) -> SwiftUI.Font {
            .custom(Typeface.heading, size: size)
        }
        static func body(_ size: CGFloat, weight: SwiftUI.Font.Weight = .regular) -> SwiftUI.Font {
            .custom(Typeface.body, size: size).weight(weight)
        }

        static let h1 = heading(42)
        static let h2 = heading(32)
        static let h3 = heading(25)
        static let h4 = heading(20)
        static let kicker = body(11, weight: .semibold)   // + uppercase + tracking .1em at call site
    }

    // MARK: Spacing — 4pt grid × 1.1

    enum Space {
        static let s1: CGFloat = 4.4
        static let s2: CGFloat = 8.8
        static let s3: CGFloat = 13.2
        static let s4: CGFloat = 17.6
        static let s6: CGFloat = 26.4
        static let s8: CGFloat = 35.2
    }

    // MARK: Radius

    enum Radius {
        static let sm: CGFloat = 8
        static let md: CGFloat = 16
        static let lg: CGFloat = 28
        static let card: CGFloat = 32   // radius-lg × 1.15
        static let pill: CGFloat = 999
    }

    // MARK: Elevation

    struct Shadow { let color: SwiftUI.Color; let radius: CGFloat; let y: CGFloat }

    enum Elevation {
        static let sm = Shadow(color: Theme.Color.neutral900.opacity(0.14), radius: 2,  y: 1)
        static let md = Shadow(color: Theme.Color.neutral900.opacity(0.16), radius: 10, y: 3)
        static let lg = Shadow(color: Theme.Color.neutral900.opacity(0.22), radius: 32, y: 12)
    }
}

extension View {
    /// Applies a Theme elevation token.
    func elevation(_ s: Theme.Shadow) -> some View {
        shadow(color: s.color, radius: s.radius, x: 0, y: s.y)
    }

    /// Kicker label styling: uppercase, tracked, small semibold.
    func kickerStyle(_ color: Color = Theme.Color.accent700) -> some View {
        font(Theme.Font.kicker)
            .textCase(.uppercase)
            .tracking(1.1)
            .foregroundStyle(color)
    }
}
