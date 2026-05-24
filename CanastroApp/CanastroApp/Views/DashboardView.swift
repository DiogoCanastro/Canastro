import SwiftUI

struct DashboardView: View {
    @EnvironmentObject var store: DataStore
    @State private var greeting = ""

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    greetingHeader
                    quickStatsRow
                    workoutCard
                    healthCard
                    goalsCard
                    sleepCard
                    tasksCard
                    projectsCard
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Dashboard")
            .onAppear { updateGreeting() }
        }
    }

    private var greetingHeader: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(greeting)
                .font(.title2)
                .fontWeight(.semibold)
                .foregroundStyle(.secondary)
            Text(Date().formatted(date: .complete, time: .omitted))
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
    }

    private var quickStatsRow: some View {
        HStack(spacing: 12) {
            QuickStatBadge(
                value: "\(store.workouts.filter { Calendar.current.isDateInThisWeek($0.date) }.count)",
                label: "Workouts\nthis week",
                icon: "figure.run",
                color: .orange
            )
            QuickStatBadge(
                value: "\(store.todoItems.filter { !$0.isCompleted }.count)",
                label: "Open\ntasks",
                icon: "checkmark.circle",
                color: .blue
            )
            QuickStatBadge(
                value: "\(store.goals.filter { !$0.isCompleted }.count)",
                label: "Active\ngoals",
                icon: "target",
                color: .green
            )
            QuickStatBadge(
                value: store.sleepEntries.first.map { String(format: "%.1fh", $0.durationHours) } ?? "—",
                label: "Last\nsleep",
                icon: "moon.fill",
                color: .indigo
            )
        }
    }

    private var workoutCard: some View {
        DashboardCard(title: "Recent Workout", icon: "figure.strengthtraining.traditional", color: .orange) {
            if let w = store.workouts.first {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(w.name).font(.headline)
                        Text(w.type.rawValue).font(.subheadline).foregroundStyle(.secondary)
                        Text(w.date, style: .relative).font(.caption).foregroundStyle(.tertiary)
                    }
                    Spacer()
                    VStack(alignment: .trailing, spacing: 4) {
                        Text("\(w.durationMinutes) min").font(.title3).fontWeight(.semibold)
                        if let cal = w.calories {
                            Label("\(cal) cal", systemImage: "flame.fill")
                                .font(.caption)
                                .foregroundStyle(.orange)
                        }
                    }
                }
            } else {
                EmptyStateInline(message: "No workouts logged yet")
            }
        }
    }

    private var healthCard: some View {
        DashboardCard(title: "Health Today", icon: "heart.fill", color: .red) {
            if let m = store.healthMetrics.first {
                HStack(spacing: 20) {
                    if let w = m.weightKg {
                        MetricPill(label: "Weight", value: String(format: "%.1f kg", w), icon: "scalemass")
                    }
                    if let s = m.steps {
                        MetricPill(label: "Steps", value: "\(s)", icon: "figure.walk")
                    }
                    if let hr = m.heartRateBpm {
                        MetricPill(label: "HR", value: "\(hr) bpm", icon: "heart")
                    }
                    if let w = m.waterLiters {
                        MetricPill(label: "Water", value: String(format: "%.1fL", w), icon: "drop")
                    }
                }
            } else {
                EmptyStateInline(message: "No health data today")
            }
        }
    }

    private var goalsCard: some View {
        DashboardCard(title: "Goals", icon: "target", color: .green) {
            let active = store.goals.filter { !$0.isCompleted }.prefix(3)
            if active.isEmpty {
                EmptyStateInline(message: "No active goals")
            } else {
                VStack(spacing: 10) {
                    ForEach(active) { goal in
                        HStack {
                            Image(systemName: goal.category.icon)
                                .foregroundStyle(.green)
                                .frame(width: 20)
                            VStack(alignment: .leading, spacing: 2) {
                                Text(goal.title).font(.subheadline).lineLimit(1)
                                ProgressView(value: goal.progress)
                                    .tint(.green)
                            }
                            Text("\(Int(goal.progress * 100))%")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                                .frame(width: 36)
                        }
                    }
                }
            }
        }
    }

    private var sleepCard: some View {
        DashboardCard(title: "Last Sleep", icon: "moon.zzz.fill", color: .indigo) {
            if let s = store.sleepEntries.first {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(String(format: "%.1f hours", s.durationHours))
                            .font(.title3).fontWeight(.semibold)
                        Label(s.quality.rawValue, systemImage: s.quality.icon)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    VStack(alignment: .trailing, spacing: 4) {
                        Label(s.bedtime, systemImage: "moon")
                            .font(.caption)
                        Label(s.wakeTime, systemImage: "sun.max")
                            .font(.caption)
                    }
                    .foregroundStyle(.secondary)
                }
            } else {
                EmptyStateInline(message: "No sleep data yet")
            }
        }
    }

    private var tasksCard: some View {
        DashboardCard(title: "Tasks", icon: "checkmark.circle.fill", color: .blue) {
            let pending = store.todoItems.filter { !$0.isCompleted }.prefix(4)
            if pending.isEmpty {
                EmptyStateInline(message: "All caught up!")
            } else {
                VStack(spacing: 8) {
                    ForEach(pending) { item in
                        HStack(spacing: 10) {
                            Image(systemName: item.priority.icon)
                                .foregroundStyle(Color(item.priority.color))
                                .frame(width: 18)
                            Text(item.title).font(.subheadline).lineLimit(1)
                            Spacer()
                            if let due = item.dueDate {
                                Text(due, style: .date)
                                    .font(.caption2)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                }
            }
        }
    }

    private var projectsCard: some View {
        DashboardCard(title: "Projects", icon: "folder.fill", color: .purple) {
            let active = store.projects.filter { $0.status == .active }.prefix(3)
            if active.isEmpty {
                EmptyStateInline(message: "No active projects")
            } else {
                VStack(spacing: 10) {
                    ForEach(active) { project in
                        HStack {
                            Circle()
                                .fill(Color(hex: project.colorHex) ?? .purple)
                                .frame(width: 10, height: 10)
                            Text(project.name).font(.subheadline).lineLimit(1)
                            Spacer()
                            ProgressView(value: project.completionPercentage)
                                .tint(Color(hex: project.colorHex) ?? .purple)
                                .frame(width: 60)
                            Text("\(Int(project.completionPercentage * 100))%")
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                                .frame(width: 32)
                        }
                    }
                }
            }
        }
    }

    private func updateGreeting() {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 5..<12: greeting = "Good morning"
        case 12..<17: greeting = "Good afternoon"
        case 17..<21: greeting = "Good evening"
        default: greeting = "Good night"
        }
    }
}

// MARK: - Reusable Components

struct DashboardCard<Content: View>: View {
    let title: String
    let icon: String
    let color: Color
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label(title, systemImage: icon)
                .font(.headline)
                .foregroundStyle(color)
            content
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

struct QuickStatBadge: View {
    let value: String
    let label: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(color)
            Text(value)
                .font(.title3)
                .fontWeight(.bold)
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}

struct MetricPill: View {
    let label: String
    let value: String
    let icon: String

    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon).font(.caption)
            Text(value).font(.caption).fontWeight(.semibold)
            Text(label).font(.caption2).foregroundStyle(.secondary)
        }
    }
}

struct EmptyStateInline: View {
    let message: String

    var body: some View {
        Text(message)
            .font(.subheadline)
            .foregroundStyle(.secondary)
            .frame(maxWidth: .infinity, alignment: .center)
            .padding(.vertical, 4)
    }
}

extension Calendar {
    func isDateInThisWeek(_ date: Date) -> Bool {
        isDate(date, equalTo: Date(), toGranularity: .weekOfYear)
    }
}

extension Color {
    init?(hex: String) {
        var str = hex.trimmingCharacters(in: .alphanumerics.inverted)
        if str.count == 6 { str = "FF" + str }
        guard str.count == 8, let val = UInt64(str, radix: 16) else { return nil }
        self.init(
            .sRGB,
            red: Double((val >> 16) & 0xFF) / 255,
            green: Double((val >> 8) & 0xFF) / 255,
            blue: Double(val & 0xFF) / 255,
            opacity: Double((val >> 24) & 0xFF) / 255
        )
    }
}

extension Color {
    init(_ name: String) {
        switch name {
        case "red": self = .red
        case "orange": self = .orange
        case "yellow": self = .yellow
        case "green": self = .green
        case "blue": self = .blue
        case "purple": self = .purple
        case "indigo": self = .indigo
        case "teal": self = .teal
        case "gray": self = .gray
        default: self = .secondary
        }
    }
}

#Preview {
    DashboardView()
        .environmentObject(DataStore.shared)
}
