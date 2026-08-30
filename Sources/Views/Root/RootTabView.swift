import SwiftUI

/// The five tabs from `Travel Journal.dc.html`: Map · Trips · Passport · Miles · Me.
struct RootTabView: View {
    enum Tab: Hashable { case map, trips, passport, miles, me }
    @State private var selection: Tab = .map

    var body: some View {
        TabView(selection: $selection) {
            MapScreen()
                .tabItem { Label("Map", systemImage: "map") }
                .tag(Tab.map)

            TripsScreen()
                .tabItem { Label("Trips", systemImage: "book.closed") }
                .tag(Tab.trips)

            PassportScreen()
                .tabItem { Label("Passport", systemImage: "person.text.rectangle") }
                .tag(Tab.passport)

            MilesScreen()
                .tabItem { Label("Miles", systemImage: "paperplane") }
                .tag(Tab.miles)

            MeScreen()
                .tabItem { Label("Me", systemImage: "person.crop.circle") }
                .tag(Tab.me)
        }
    }
}

#Preview {
    RootTabView()
        .modelContainer(Persistence.makeContainer(inMemory: true))
}
