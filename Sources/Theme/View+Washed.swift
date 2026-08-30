import SwiftUI

extension View {
    /// The faded-photo treatment every image gets in the prototype:
    /// `.washed` = saturation .6, contrast .85, brightness 1.1, opacity .94.
    func washed() -> some View {
        self
            .saturation(0.6)
            .contrast(0.85)
            .brightness(0.1)      // SwiftUI brightness is additive; ~1.1 multiplier
            .opacity(0.94)
    }
}
