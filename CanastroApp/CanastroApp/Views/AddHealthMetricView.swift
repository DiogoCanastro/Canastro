import SwiftUI

struct AddHealthMetricView: View {
    @EnvironmentObject var store: DataStore
    @Environment(\.dismiss) private var dismiss

    @State private var date = Date()
    @State private var weightStr = ""
    @State private var stepsStr = ""
    @State private var heartRateStr = ""
    @State private var waterStr = ""
    @State private var caloriesStr = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("Date") {
                    DatePicker("Date", selection: $date, displayedComponents: .date)
                }
                Section("Metrics") {
                    HStack {
                        Label("Weight", systemImage: "scalemass.fill").foregroundStyle(.blue)
                        Spacer()
                        TextField("kg", text: $weightStr).keyboardType(.decimalPad).multilineTextAlignment(.trailing).frame(width: 80)
                    }
                    HStack {
                        Label("Steps", systemImage: "figure.walk").foregroundStyle(.green)
                        Spacer()
                        TextField("steps", text: $stepsStr).keyboardType(.numberPad).multilineTextAlignment(.trailing).frame(width: 80)
                    }
                    HStack {
                        Label("Heart Rate", systemImage: "heart.fill").foregroundStyle(.red)
                        Spacer()
                        TextField("bpm", text: $heartRateStr).keyboardType(.numberPad).multilineTextAlignment(.trailing).frame(width: 80)
                    }
                    HStack {
                        Label("Water", systemImage: "drop.fill").foregroundStyle(.cyan)
                        Spacer()
                        TextField("liters", text: $waterStr).keyboardType(.decimalPad).multilineTextAlignment(.trailing).frame(width: 80)
                    }
                    HStack {
                        Label("Calories", systemImage: "fork.knife").foregroundStyle(.orange)
                        Spacer()
                        TextField("kcal", text: $caloriesStr).keyboardType(.numberPad).multilineTextAlignment(.trailing).frame(width: 80)
                    }
                }
            }
            .navigationTitle("Log Health Data")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) { Button("Save") { save() } }
            }
        }
    }

    private func save() {
        let metric = HealthMetric(
            date: date,
            weightKg: Double(weightStr),
            steps: Int(stepsStr),
            heartRateBpm: Int(heartRateStr),
            waterLiters: Double(waterStr),
            caloriesConsumed: Int(caloriesStr)
        )
        store.addHealthMetric(metric)
        dismiss()
    }
}

#Preview {
    AddHealthMetricView().environmentObject(DataStore.shared)
}
