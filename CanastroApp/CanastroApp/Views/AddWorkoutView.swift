import SwiftUI

struct AddWorkoutView: View {
    @EnvironmentObject var store: DataStore
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var type = WorkoutType.strength
    @State private var duration = 45
    @State private var date = Date()
    @State private var caloriesStr = ""
    @State private var notes = ""
    @State private var exercises: [Exercise] = []
    @State private var showAddExercise = false
    @State private var newExName = ""
    @State private var newExSets = 3
    @State private var newExReps = 10
    @State private var newExWeight = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("Details") {
                    TextField("Workout name", text: $name)
                    Picker("Type", selection: $type) {
                        ForEach(WorkoutType.allCases, id: \.self) { t in
                            Label(t.rawValue, systemImage: t.icon).tag(t)
                        }
                    }
                    DatePicker("Date", selection: $date, displayedComponents: [.date, .hourAndMinute])
                    Stepper("Duration: \(duration) min", value: $duration, in: 5...300, step: 5)
                    TextField("Calories burned (optional)", text: $caloriesStr)
                        .keyboardType(.numberPad)
                }

                Section("Exercises") {
                    ForEach(exercises) { ex in
                        HStack {
                            Text(ex.name)
                            Spacer()
                            Text("\(ex.sets)×\(ex.reps)")
                                .foregroundStyle(.secondary)
                            if let w = ex.weight {
                                Text("@ \(Int(w))kg")
                                    .foregroundStyle(.orange)
                            }
                        }
                    }
                    .onDelete { exercises.remove(atOffsets: $0) }

                    Button("Add Exercise") { showAddExercise = true }
                }

                Section("Notes") {
                    TextEditor(text: $notes)
                        .frame(minHeight: 80)
                }
            }
            .navigationTitle("New Workout")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { save() }
                        .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
            .sheet(isPresented: $showAddExercise) {
                addExerciseSheet
            }
        }
    }

    private var addExerciseSheet: some View {
        NavigationStack {
            Form {
                TextField("Exercise name", text: $newExName)
                Stepper("Sets: \(newExSets)", value: $newExSets, in: 1...20)
                Stepper("Reps: \(newExReps)", value: $newExReps, in: 1...100)
                TextField("Weight (kg, optional)", text: $newExWeight)
                    .keyboardType(.decimalPad)
            }
            .navigationTitle("Add Exercise")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { showAddExercise = false }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add") {
                        exercises.append(Exercise(
                            name: newExName,
                            sets: newExSets,
                            reps: newExReps,
                            weight: Double(newExWeight)
                        ))
                        newExName = ""; newExWeight = ""
                        newExSets = 3; newExReps = 10
                        showAddExercise = false
                    }
                    .disabled(newExName.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
    }

    private func save() {
        let workout = Workout(
            name: name,
            type: type,
            durationMinutes: duration,
            date: date,
            calories: Int(caloriesStr),
            notes: notes,
            exercises: exercises
        )
        store.addWorkout(workout)
        dismiss()
    }
}

#Preview {
    AddWorkoutView().environmentObject(DataStore.shared)
}
