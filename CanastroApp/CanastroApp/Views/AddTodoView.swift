import SwiftUI

struct AddTodoView: View {
    @EnvironmentObject var store: DataStore
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var notes = ""
    @State private var priority = Priority.medium
    @State private var hasDueDate = false
    @State private var dueDate = Calendar.current.date(byAdding: .day, value: 1, to: Date()) ?? Date()
    @State private var tagInput = ""
    @State private var tags: [String] = []

    var body: some View {
        NavigationStack {
            Form {
                Section("Task") {
                    TextField("What needs to be done?", text: $title)
                    TextEditor(text: $notes)
                        .frame(minHeight: 60)
                        .overlay(
                            notes.isEmpty ? Text("Notes (optional)").foregroundStyle(.tertiary).padding(4) : nil,
                            alignment: .topLeading
                        )
                }
                Section("Priority") {
                    Picker("Priority", selection: $priority) {
                        ForEach(Priority.allCases, id: \.self) { p in
                            Label(p.rawValue, systemImage: p.icon).tag(p)
                        }
                    }
                    .pickerStyle(.segmented)
                }
                Section("Due Date") {
                    Toggle("Has due date", isOn: $hasDueDate)
                    if hasDueDate {
                        DatePicker("Due", selection: $dueDate, displayedComponents: .date)
                    }
                }
                Section("Tags") {
                    if !tags.isEmpty {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack {
                                ForEach(tags, id: \.self) { tag in
                                    HStack(spacing: 4) {
                                        Text(tag).font(.caption)
                                        Button(action: { tags.removeAll { $0 == tag } }) {
                                            Image(systemName: "xmark.circle.fill").font(.caption2)
                                        }
                                    }
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 4)
                                    .background(Color.blue.opacity(0.1))
                                    .clipShape(Capsule())
                                }
                            }
                        }
                    }
                    HStack {
                        TextField("Add tag", text: $tagInput)
                        Button("Add") {
                            let t = tagInput.trimmingCharacters(in: .whitespaces)
                            if !t.isEmpty && !tags.contains(t) {
                                tags.append(t)
                                tagInput = ""
                            }
                        }
                        .disabled(tagInput.trimmingCharacters(in: .whitespaces).isEmpty)
                    }
                }
            }
            .navigationTitle("New Task")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { save() }
                        .disabled(title.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
    }

    private func save() {
        store.addTodo(TodoItem(
            title: title,
            notes: notes,
            priority: priority,
            dueDate: hasDueDate ? dueDate : nil,
            isCompleted: false,
            createdAt: Date(),
            tags: tags
        ))
        dismiss()
    }
}

#Preview {
    AddTodoView().environmentObject(DataStore.shared)
}
