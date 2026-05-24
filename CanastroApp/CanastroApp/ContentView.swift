import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            DashboardView()
                .tabItem {
                    Label("Dashboard", systemImage: "house.fill")
                }

            WorkoutsView()
                .tabItem {
                    Label("Workouts", systemImage: "figure.strengthtraining.traditional")
                }

            HealthGoalsView()
                .tabItem {
                    Label("Health", systemImage: "heart.fill")
                }

            SleepView()
                .tabItem {
                    Label("Sleep", systemImage: "moon.zzz.fill")
                }

            ProductivityView()
                .tabItem {
                    Label("Tasks", systemImage: "checkmark.circle.fill")
                }
        }
        .tint(.indigo)
    }
}

#Preview {
    ContentView()
        .environmentObject(DataStore.shared)
}
