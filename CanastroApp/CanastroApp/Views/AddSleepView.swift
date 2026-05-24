import SwiftUI

struct AddSleepView: View {
    @EnvironmentObject var store: DataStore
    @Environment(\.dismiss) private var dismiss

    @State private var date = Date()
    @State private var bedtime: Date = {
        Calendar.current.date(bySettingHour: 23, minute: 0, second: 0, of: Date()) ?? Date()
    }()
    @State private var wakeTime: Date = {
        let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: Date()) ?? Date()
        return Calendar.current.date(bySettingHour: 7, minute: 0, second: 0, of: tomorrow) ?? Date()
    }()
    @State private var quality = SleepQuality.good
    @State private var notes = ""

    var duration: Double {
        max(wakeTime.timeIntervalSince(bedtime) / 3600, 0)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Date") {
                    DatePicker("Night of", selection: $date, displayedComponents: .date)
                }
                Section("Times") {
                    DatePicker("Bedtime", selection: $bedtime, displayedComponents: .hourAndMinute)
                    DatePicker("Wake time", selection: $wakeTime, displayedComponents: .hourAndMinute)
                    HStack {
                        Text("Duration")
                        Spacer()
                        Text(String(format: "%.1f hours", duration))
                            .foregroundStyle(.secondary)
                    }
                }
                Section("Quality") {
                    Picker("Sleep quality", selection: $quality) {
                        ForEach(SleepQuality.allCases, id: \.self) { q in
                            Label(q.rawValue, systemImage: q.icon).tag(q)
                        }
                    }
                    .pickerStyle(.segmented)
                }
                Section("Notes") {
                    TextEditor(text: $notes).frame(minHeight: 60)
                }
            }
            .navigationTitle("Log Sleep")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) { Button("Save") { save() } }
            }
        }
    }

    private func save() {
        store.addSleepEntry(SleepEntry(
            date: date,
            bedtime: bedtime,
            wakeTime: wakeTime,
            quality: quality,
            notes: notes
        ))
        dismiss()
    }
}

#Preview {
    AddSleepView().environmentObject(DataStore.shared)
}
