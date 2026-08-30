import SwiftUI
import SwiftData

@main
struct TravelJournalApp: App {
    let container: ModelContainer

    init() {
        let container = Persistence.makeContainer()
        self.container = container
        Persistence.bootstrap(container.mainContext)
    }

    var body: some Scene {
        WindowGroup {
            RootTabView()
                .tint(Theme.Color.accent)
        }
        .modelContainer(container)
    }
}
