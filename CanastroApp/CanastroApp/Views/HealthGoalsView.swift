import SwiftUI

struct HealthGoalsView: View {
    var body: some View {
        NavigationStack {
            List {
                NavigationLink(destination: HealthView()) {
                    Label("Health Metrics", systemImage: "heart.fill")
                        .foregroundStyle(.red)
                }
                NavigationLink(destination: GoalsView()) {
                    Label("Goals", systemImage: "target")
                        .foregroundStyle(.green)
                }
            }
            .navigationTitle("Health & Goals")
        }
    }
}

// MARK: - Health View

struct HealthView: View {
    @EnvironmentObject var store: DataStore
    @State private var showAdd = false

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                if let latest = store.healthMetrics.first {
                    latestCard(latest)
                }
                metricsHistory
            }
            .padding()
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("Health Metrics")
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button(action: { showAdd = true }) {
                    Image(systemName: "plus.circle.fill").font(.title3)
                }
            }
        }
        .sheet(isPresented: $showAdd) {
            AddHealthMetricView()
        }
    }

    private func latestCard(_ m: HealthMetric) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            Label("Today", systemImage: "calendar")
                .font(.headline)
                .foregroundStyle(.red)
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                if let w = m.weightKg {
                    HealthMetricTile(label: "Weight", value: String(format: "%.1f kg", w), icon: "scalemass.fill", color: .blue)
                }
                if let s = m.steps {
                    HealthMetricTile(label: "Steps", value: "\(s)", icon: "figure.walk", color: .green)
                }
                if let hr = m.heartRateBpm {
                    HealthMetricTile(label: "Heart Rate", value: "\(hr) bpm", icon: "heart.fill", color: .red)
                }
                if let wt = m.waterLiters {
                    HealthMetricTile(label: "Water", value: String(format: "%.1f L", wt), icon: "drop.fill", color: .cyan)
                }
                if let cal = m.caloriesConsumed {
                    HealthMetricTile(label: "Calories", value: "\(cal) kcal", icon: "fork.knife", color: .orange)
                }
            }
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var metricsHistory: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("History")
                .font(.headline)
                .padding(.horizontal, 4)
            LazyVStack(spacing: 10) {
                ForEach(store.healthMetrics.dropFirst()) { m in
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(m.date, style: .date).font(.subheadline).fontWeight(.medium)
                            HStack(spacing: 12) {
                                if let w = m.weightKg { Text(String(format: "%.1fkg", w)).font(.caption).foregroundStyle(.blue) }
                                if let s = m.steps { Text("\(s) steps").font(.caption).foregroundStyle(.green) }
                                if let hr = m.heartRateBpm { Text("\(hr)bpm").font(.caption).foregroundStyle(.red) }
                            }
                        }
                        Spacer()
                        if let wt = m.waterLiters {
                            Label(String(format: "%.1fL", wt), systemImage: "drop.fill")
                                .font(.caption)
                                .foregroundStyle(.cyan)
                        }
                    }
                    .padding()
                    .background(Color(.secondarySystemGroupedBackground))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }
            }
        }
    }
}

struct HealthMetricTile: View {
    let label: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(color)
            Text(value)
                .font(.title3)
                .fontWeight(.semibold)
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(color.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}

// MARK: - Goals View

struct GoalsView: View {
    @EnvironmentObject var store: DataStore
    @State private var showAdd = false
    @State private var filter: GoalFilter = .active

    enum GoalFilter: String, CaseIterable {
        case all = "All"
        case active = "Active"
        case completed = "Completed"
    }

    var filtered: [Goal] {
        switch filter {
        case .all: return store.goals
        case .active: return store.goals.filter { !$0.isCompleted }
        case .completed: return store.goals.filter { $0.isCompleted }
        }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                Picker("Filter", selection: $filter) {
                    ForEach(GoalFilter.allCases, id: \.self) { f in
                        Text(f.rawValue).tag(f)
                    }
                }
                .pickerStyle(.segmented)

                if filtered.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "target").font(.system(size: 48)).foregroundStyle(.green.opacity(0.6))
                        Text("No goals yet").font(.headline)
                        Text("Tap + to add a goal").font(.subheadline).foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity).padding(40)
                } else {
                    LazyVStack(spacing: 12) {
                        ForEach(filtered) { goal in
                            GoalCard(goal: goal)
                        }
                    }
                }
            }
            .padding()
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("Goals")
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button(action: { showAdd = true }) {
                    Image(systemName: "plus.circle.fill").font(.title3)
                }
            }
        }
        .sheet(isPresented: $showAdd) {
            AddGoalView()
        }
    }
}

struct GoalCard: View {
    @EnvironmentObject var store: DataStore
    let goal: Goal

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                ZStack {
                    Circle()
                        .fill(Color(goal.category.color).opacity(0.15))
                        .frame(width: 36, height: 36)
                    Image(systemName: goal.category.icon)
                        .foregroundStyle(Color(goal.category.color))
                }
                VStack(alignment: .leading, spacing: 2) {
                    Text(goal.title).font(.headline)
                    Text(goal.category.rawValue).font(.caption).foregroundStyle(.secondary)
                }
                Spacer()
                if goal.isCompleted {
                    Image(systemName: "checkmark.circle.fill").foregroundStyle(.green)
                }
            }

            if !goal.description.isEmpty {
                Text(goal.description).font(.subheadline).foregroundStyle(.secondary)
            }

            VStack(spacing: 6) {
                HStack {
                    Text(String(format: "%.1f / %.1f %@", goal.currentValue, goal.targetValue, goal.unit))
                        .font(.subheadline)
                    Spacer()
                    Text("\(Int(goal.progress * 100))%")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundStyle(Color(goal.category.color))
                }
                ProgressView(value: goal.progress)
                    .tint(Color(goal.category.color))
                    .scaleEffect(y: 1.5)
            }

            if let deadline = goal.deadline {
                Label(deadline, style: .date)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            HStack {
                Button(goal.isCompleted ? "Mark Incomplete" : "Mark Complete") {
                    var updated = goal
                    updated.isCompleted.toggle()
                    store.updateGoal(updated)
                }
                .font(.caption)
                .buttonStyle(.bordered)
                .tint(goal.isCompleted ? .orange : .green)
            }
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

#Preview {
    HealthGoalsView().environmentObject(DataStore.shared)
}
