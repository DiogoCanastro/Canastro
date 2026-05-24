import SwiftUI

struct AddProjectView: View {
    @EnvironmentObject var store: DataStore
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var description = ""
    @State private var status = ProjectStatus.active
    @State private var startDate = Date()
    @State private var hasDeadline = false
    @State private var deadline = Calendar.current.date(byAdding: .month, value: 1, to: Date()) ?? Date()
    @State private var selectedColor = "5E5CE6"
    @State private var tagInput = ""
    @State private var tags: [String] = []

    let colorOptions: [(name: String, hex: String)] = [
        ("Indigo", "5E5CE6"), ("Blue", "0A84FF"), ("Purple", "BF5AF2"),
        ("Pink", "FF375F"), ("Orange", "FF9F0A"), ("Green", "30D158"),
        ("Teal", "5AC8FA"), ("Red", "FF453A")
    ]

    var body: some View {
        NavigationStack {
            Form {
                Section("Project") {
                    TextField("Project name", text: $name)
                    TextEditor(text: $description)
                        .frame(minHeight: 60)
                        .overlay(
                            description.isEmpty ? Text("Description (optional)").foregroundStyle(.tertiary).padding(4) : nil,
                            alignment: .topLeading
                        )
                }
                Section("Status") {
                    Picker("Status", selection: $status) {
                        ForEach(ProjectStatus.allCases, id: \.self) { s in
                            Label(s.rawValue, systemImage: s.icon).tag(s)
                        }
                    }
                }
                Section("Color") {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ForEach(colorOptions, id: \.hex) { option in
                                Button(action: { selectedColor = option.hex }) {
                                    ZStack {
                                        Circle()
                                            .fill(Color(hex: option.hex) ?? .purple)
                                            .frame(width: 36, height: 36)
                                        if selectedColor == option.hex {
                                            Image(systemName: "checkmark")
                                                .foregroundStyle(.white)
                                                .fontWeight(.bold)
                                        }
                                    }
                                }
                            }
                        }
                        .padding(.vertical, 4)
                    }
                }
                Section("Timeline") {
                    DatePicker("Start date", selection: $startDate, displayedComponents: .date)
                    Toggle("Has deadline", isOn: $hasDeadline)
                    if hasDeadline {
                        DatePicker("Deadline", selection: $deadline, displayedComponents: .date)
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
                                    .padding(.horizontal, 10).padding(.vertical, 4)
                                    .background(Color(hex: selectedColor)?.opacity(0.15) ?? Color.purple.opacity(0.15))
                                    .clipShape(Capsule())
                                }
                            }
                        }
                    }
                    HStack {
                        TextField("Add tag", text: $tagInput)
                        Button("Add") {
                            let t = tagInput.trimmingCharacters(in: .whitespaces)
                            if !t.isEmpty && !tags.contains(t) { tags.append(t); tagInput = "" }
                        }
                        .disabled(tagInput.trimmingCharacters(in: .whitespaces).isEmpty)
                    }
                }
            }
            .navigationTitle("New Project")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Create") { save() }
                        .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
    }

    private func save() {
        store.addProject(Project(
            name: name,
            description: description,
            status: status,
            startDate: startDate,
            deadline: hasDeadline ? deadline : nil,
            tasks: [],
            colorHex: selectedColor,
            tags: tags
        ))
        dismiss()
    }
}

#Preview {
    AddProjectView().environmentObject(DataStore.shared)
}
