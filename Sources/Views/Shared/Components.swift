import SwiftUI

// The component library from PLAN.md §6. Minimal but on-token — screens compose
// these rather than re-styling. Extend as tabs get built out.

/// Rounded surface card with soft elevation. `radius-lg × 1.15`, surface fill.
struct Card<Content: View>: View {
    var padding: CGFloat = Theme.Space.s3
    @ViewBuilder var content: Content

    var body: some View {
        content
            .padding(padding)
            .background(Theme.Color.surface, in: RoundedRectangle(cornerRadius: Theme.Radius.card, style: .continuous))
            .elevation(Theme.Elevation.sm)
    }
}

/// Uppercase tracked label ("YOUR WORLD", "SINCE 2025").
struct Kicker: View {
    let text: String
    var color: Color = Theme.Color.accent700
    init(_ text: String, color: Color = Theme.Color.accent700) { self.text = text; self.color = color }
    var body: some View { Text(text).kickerStyle(color) }
}

/// Big display number + small caption. Neutral-100 tile.
struct StatTile: View {
    let value: String
    let label: String
    var valueColor: Color = Theme.Color.accent700

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Space.s1) {
            Text(value)
                .font(Theme.Font.heading(26))
                .foregroundStyle(valueColor)
            Text(label)
                .font(Theme.Font.body(11))
                .foregroundStyle(Theme.Color.neutral700)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(Theme.Space.s3)
        .background(Theme.Color.neutral100, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
    }
}

enum TagKind { case accent, sage, neutral }

/// Pill tag. Three tints matching the prototype.
struct Tag: View {
    let text: String
    var kind: TagKind = .neutral

    private var bg: Color {
        switch kind {
        case .accent:  return Theme.Color.accent200
        case .sage:    return Theme.Color.accent2_200
        case .neutral: return Theme.Color.neutral200
        }
    }
    private var fg: Color {
        switch kind {
        case .accent:  return Theme.Color.accent800
        case .sage:    return Theme.Color.accent2_800
        case .neutral: return Theme.Color.neutral800
        }
    }

    var body: some View {
        Text(text)
            .font(Theme.Font.body(11, weight: .semibold))
            .padding(.horizontal, 11).padding(.vertical, 5)
            .background(bg, in: Capsule())
            .foregroundStyle(fg)
    }
}

/// Full-width accent pill button.
struct PrimaryButton: View {
    let title: String
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(Theme.Font.heading(16))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 15)
                .background(Theme.Color.accent, in: Capsule())
                .foregroundStyle(Theme.Color.bg)
        }
        .buttonStyle(.plain)
        .elevation(Theme.Elevation.sm)
    }
}

/// Standard tab screen chrome: cream ground, large heading + optional kicker,
/// scrolling content. Matches the prototype's `64px 20px 12px` insets.
struct ScreenScaffold<Content: View>: View {
    let title: String
    var kicker: String?
    @ViewBuilder var content: Content

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.Space.s4) {
                VStack(alignment: .leading, spacing: Theme.Space.s1) {
                    if let kicker { Kicker(kicker) }
                    Text(title).font(Theme.Font.h2).foregroundStyle(Theme.Color.text)
                }
                content
            }
            .padding(.horizontal, 20)
            .padding(.top, 64)
            .padding(.bottom, 12)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .background(Theme.Color.bg)
    }
}

/// Placeholder for a not-yet-built screen area — keeps stubs honest about scope.
struct ComingSoon: View {
    let note: String
    var body: some View {
        Card {
            VStack(alignment: .leading, spacing: Theme.Space.s2) {
                Kicker("Not built yet", color: Theme.Color.neutral600)
                Text(note)
                    .font(Theme.Font.body(13))
                    .foregroundStyle(Theme.Color.neutral700)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}
