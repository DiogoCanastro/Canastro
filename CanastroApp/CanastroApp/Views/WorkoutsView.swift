import SwiftUI

struct WorkoutsView: View {
    @EnvironmentObject var store: DataStore
    @State private var showAdd = false
    @State private var selectedFilter: WorkoutType? = nil

    var filtered: [Workout] {
        guard let f = selectedFilter else { return store.workouts }
        return store.workouts.filter { $0.type == f }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    weekSummary
                    filterRow
                    if filtered.isEmpty {
                        emptyState
                    } else {
                        workoutList
                    }
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Workouts")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button(action: { showAdd = true }) {
                        Image(systemName: "plus.circle.fill")
                            .font(.title3)
                    }
                }
            }
            .sheet(isPresented: $showAdd) {
                AddWorkoutView()
            }
        }
    }

    private var weekSummary: some View {
        let weekWorkouts = store.workouts.filter { Calendar.current.isDateInThisWeek($0.date) }
        let totalMinutes = weekWorkouts.reduce(0) { $0 + $1.durationMinutes }
        let totalCalories = weekWorkouts.compactMap(\.calories).reduce(0, +)

        return HStack(spacing: 0) {
            SummaryCell(value: "\(weekWorkouts.count)", label: "Sessions", icon: "figure.run", color: .orange)
            Divider().frame(height: 40)
            SummaryCell(value: "\(totalMinutes)m", label: "Total time", icon: "clock", color: .blue)
            Divider().frame(height: 40)
            SummaryCell(value: "\(totalCalories)", label: "Calories", icon: "flame", color: .red)
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var filterRow: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                FilterChip(label: "All", isSelected: selectedFilter == nil) {
                    selectedFilter = nil
                }
                ForEach(WorkoutType.allCases, id: \.self) { type in
                    FilterChip(label: type.rawValue, isSelected: selectedFilter == type) {
                        selectedFilter = selectedFilter == type ? nil : type
                    }
                }
            }
            .padding(.horizontal, 2)
        }
    }

    private var workoutList: some View {
        LazyVStack(spacing: 12) {
            ForEach(filtered) { workout in
                NavigationLink(destination: WorkoutDetailView(workout: workout)) {
                    WorkoutRow(workout: workout)
                }
                .buttonStyle(.plain)
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "figure.strengthtraining.traditional")
                .font(.system(size: 48))
                .foregroundStyle(.orange.opacity(0.6))
            Text("No workouts logged")
                .font(.headline)
            Text("Tap + to add your first workout")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(40)
    }
}

struct WorkoutRow: View {
    let workout: Workout

    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                Circle()
                    .fill(.orange.opacity(0.15))
                    .frame(width: 48, height: 48)
                Image(systemName: workout.type.icon)
                    .font(.title3)
                    .foregroundStyle(.orange)
            }
            VStack(alignment: .leading, spacing: 4) {
                Text(workout.name).font(.headline)
                HStack(spacing: 8) {
                    Text(workout.type.rawValue)
                    Text("·")
                    Text("\(workout.durationMinutes) min")
                    if let cal = workout.calories {
                        Text("·")
                        Text("\(cal) cal")
                    }
                }
                .font(.subheadline)
                .foregroundStyle(.secondary)
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 4) {
                Text(workout.date, style: .date)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text(workout.date, style: .time)
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}

struct WorkoutDetailView: View {
    let workout: Workout

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                HStack {
                    Label(workout.type.rawValue, systemImage: workout.type.icon)
                        .font(.headline)
                        .foregroundStyle(.orange)
                    Spacer()
                    Text(workout.date, style: .date)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                HStack(spacing: 20) {
                    InfoTile(label: "Duration", value: "\(workout.durationMinutes) min", icon: "clock")
                    if let cal = workout.calories {
                        InfoTile(label: "Calories", value: "\(cal)", icon: "flame.fill")
                    }
                }

                if !workout.exercises.isEmpty {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Exercises").font(.headline)
                        ForEach(workout.exercises) { ex in
                            HStack {
                                Text(ex.name).font(.subheadline)
                                Spacer()
                                Text("\(ex.sets) × \(ex.reps)")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                                if let w = ex.weight {
                                    Text("@ \(Int(w))kg")
                                        .font(.subheadline)
                                        .foregroundStyle(.orange)
                                }
                            }
                            .padding(.vertical, 6)
                            Divider()
                        }
                    }
                    .padding()
                    .background(Color(.secondarySystemGroupedBackground))
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                }

                if !workout.notes.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Notes").font(.headline)
                        Text(workout.notes)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .padding()
                    .background(Color(.secondarySystemGroupedBackground))
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                }
            }
            .padding()
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle(workout.name)
        .navigationBarTitleDisplayMode(.large)
    }
}

struct SummaryCell: View {
    let value: String
    let label: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon).foregroundStyle(color)
            Text(value).font(.title3).fontWeight(.bold)
            Text(label).font(.caption2).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
    }
}

struct FilterChip: View {
    let label: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(label)
                .font(.subheadline)
                .padding(.horizontal, 14)
                .padding(.vertical, 7)
                .background(isSelected ? Color.orange : Color(.secondarySystemGroupedBackground))
                .foregroundStyle(isSelected ? .white : .primary)
                .clipShape(Capsule())
        }
    }
}

struct InfoTile: View {
    let label: String
    let value: String
    let icon: String

    var body: some View {
        VStack(spacing: 6) {
            Image(systemName: icon).foregroundStyle(.orange)
            Text(value).font(.title3).fontWeight(.semibold)
            Text(label).font(.caption).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

#Preview {
    WorkoutsView().environmentObject(DataStore.shared)
}
