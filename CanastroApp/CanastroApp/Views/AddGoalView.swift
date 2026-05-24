import SwiftUI

struct AddGoalView: View {
    @EnvironmentObject var store: DataStore
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var description = ""
    @State private var category = GoalCategory.personal
    @State private var targetStr = ""
    @State private var currentStr = "0"
    @State private var unit = ""
    @State private var hasDeadline = false
    @State private var deadline = Calendar.current.date(byAdding: .month, value: 1, to: Date()) ?? Date()

    var body: some View {
        NavigationStack {
            Form {
                Section("Goal") {
                    TextField("Title", text: $title)
                    TextField("Description (optional)", text: $description, axis: .vertical)
                    Picker("Category", selection: $category) {
                        ForEach(GoalCategory.allCases, id: \.self) { c in
                            Label(c.rawValue, systemImage: c.icon).tag(c)
                        }
                    }
                }
                Section("Progress") {
                    HStack {
                        Text("Unit")
                        TextField("e.g. km, pages, hours", text: $unit)
                            .multilineTextAlignment(.trailing)
                    }
                    HStack {
                        Text("Target")
                        TextField("e.g. 100", text: $targetStr)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                    }
                    HStack {
                        Text("Current")
                        TextField("e.g. 0", text: $currentStr)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                    }
                }
                Section("Deadline") {
                    Toggle("Has deadline", isOn: $hasDeadline)
                    if hasDeadline {
                        DatePicker("Deadline", selection: $deadline, displayedComponents: .date)
                    }
                }
            }
            .navigationTitle("New Goal")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { save() }
                        .disabled(title.trimmingCharacters(in: .whitespaces).isEmpty || targetStr.isEmpty)
                }
            }
        }
    }

    private func save() {
        let goal = Goal(
            title: title,
            description: description,
            category: category,
            targetValue: Double(targetStr) ?? 1,
            currentValue: Double(currentStr) ?? 0,
            unit: unit,
            deadline: hasDeadline ? deadline : nil,
            isCompleted: false,
            createdAt: Date()
        )
        store.addGoal(goal)
        dismiss()
    }
}

#Preview {
    AddGoalView().environmentObject(DataStore.shared)
}
