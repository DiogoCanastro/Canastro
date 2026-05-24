import SwiftUI

struct SleepView: View {
    @EnvironmentObject var store: DataStore
    @State private var showAdd = false

    var averageSleep: Double {
        guard !store.sleepEntries.isEmpty else { return 0 }
        let total = store.sleepEntries.prefix(7).reduce(0.0) { $0 + $1.durationHours }
        return total / Double(min(store.sleepEntries.count, 7))
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    sleepSummary
                    sleepChart
                    entriesList
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Sleep")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button(action: { showAdd = true }) {
                        Image(systemName: "plus.circle.fill").font(.title3)
                    }
                }
            }
            .sheet(isPresented: $showAdd) {
                AddSleepView()
            }
        }
    }

    private var sleepSummary: some View {
        HStack(spacing: 0) {
            SummaryCell(
                value: String(format: "%.1fh", averageSleep),
                label: "Avg (7 days)",
                icon: "moon.fill",
                color: .indigo
            )
            Divider().frame(height: 40)
            SummaryCell(
                value: store.sleepEntries.first.map { String(format: "%.1fh", $0.durationHours) } ?? "—",
                label: "Last night",
                icon: "zzz",
                color: .purple
            )
            Divider().frame(height: 40)
            SummaryCell(
                value: store.sleepEntries.first?.quality.rawValue ?? "—",
                label: "Quality",
                icon: store.sleepEntries.first?.quality.icon ?? "moon",
                color: .blue
            )
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var sleepChart: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Last 7 Nights")
                .font(.headline)
            HStack(alignment: .bottom, spacing: 8) {
                ForEach(store.sleepEntries.prefix(7).reversed().indices, id: \.self) { i in
                    let entries = Array(store.sleepEntries.prefix(7).reversed())
                    let entry = entries[i]
                    let maxH = 10.0
                    let h = min(entry.durationHours / maxH, 1.0)
                    VStack(spacing: 4) {
                        RoundedRectangle(cornerRadius: 6)
                            .fill(sleepBarColor(entry.durationHours))
                            .frame(height: max(h * 100, 8))
                        Text(entry.date, format: .dateTime.weekday(.abbreviated))
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity)
                }
            }
            .frame(height: 120)
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private func sleepBarColor(_ hours: Double) -> Color {
        if hours >= 8 { return .indigo }
        if hours >= 7 { return .blue }
        if hours >= 6 { return .orange }
        return .red
    }

    private var entriesList: some View {
        LazyVStack(spacing: 10) {
            ForEach(store.sleepEntries) { entry in
                SleepEntryRow(entry: entry)
            }
        }
    }
}

struct SleepEntryRow: View {
    let entry: SleepEntry

    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                Circle()
                    .fill(Color(entry.quality.color).opacity(0.15))
                    .frame(width: 48, height: 48)
                Image(systemName: entry.quality.icon)
                    .font(.title3)
                    .foregroundStyle(Color(entry.quality.color))
            }
            VStack(alignment: .leading, spacing: 4) {
                Text(entry.date, style: .date).font(.headline)
                HStack(spacing: 6) {
                    Image(systemName: "moon").font(.caption2)
                    Text(entry.bedtime, style: .time).font(.caption)
                    Image(systemName: "arrow.right").font(.caption2)
                    Image(systemName: "sun.max").font(.caption2)
                    Text(entry.wakeTime, style: .time).font(.caption)
                }
                .foregroundStyle(.secondary)
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 4) {
                Text(String(format: "%.1fh", entry.durationHours))
                    .font(.title3)
                    .fontWeight(.semibold)
                Text(entry.quality.rawValue)
                    .font(.caption)
                    .foregroundStyle(Color(entry.quality.color))
            }
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}

#Preview {
    SleepView().environmentObject(DataStore.shared)
}
