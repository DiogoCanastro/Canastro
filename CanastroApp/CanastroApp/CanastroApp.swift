import SwiftUI

@main
struct CanastroApp: App {
    @StateObject private var store = DataStore.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(store)
        }
    }
}
