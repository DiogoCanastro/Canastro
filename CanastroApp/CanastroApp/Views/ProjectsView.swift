import SwiftUI

struct ProjectsView: View {
    @EnvironmentObject var store: DataStore
    @State private var showAdd = false
    @State private var selectedStatus: ProjectStatus? = nil

    var filtered: [Project] {
        guard let s = selectedStatus else { return store.projects }
        return store.projects.filter { $0.status == s }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                statusSummary
                filterRow
                if filtered.isEmpty {
                    emptyState
                } else {
                    projectList
                }
            }
            .padding()
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("Projects")
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button(action: { showAdd = true }) {
                    Image(systemName: "plus.circle.fill").font(.title3)
                }
            }
        }
        .sheet(isPresented: $showAdd) {
            AddProjectView()
        }
    }

    private var statusSummary: some View {
        HStack(spacing: 0) {
            SummaryCell(
                value: "\(store.projects.filter { $0.status == .active }.count)",
                label: "Active",
                icon: "play.circle.fill",
                color: .blue
            )
            Divider().frame(height: 40)
            SummaryCell(
                value: "\(store.projects.filter { $0.status == .planning }.count)",
                label: "Planning",
                icon: "pencil.circle",
                color: .gray
            )
            Divider().frame(height: 40)
            SummaryCell(
                value: "\(store.projects.filter { $0.status == .completed }.count)",
                label: "Done",
                icon: "checkmark.circle.fill",
                color: .green
            )
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var filterRow: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                FilterChip(label: "All", isSelected: selectedStatus == nil) {
                    selectedStatus = nil
                }
                ForEach(ProjectStatus.allCases, id: \.self) { status in
                    FilterChip(label: status.rawValue, isSelected: selectedStatus == status) {
                        selectedStatus = selectedStatus == status ? nil : status
                    }
                }
            }
            .padding(.horizontal, 2)
        }
    }

    private var projectList: some View {
        LazyVStack(spacing: 14) {
            ForEach(filtered) { project in
                NavigationLink(destination: ProjectDetailView(project: project)) {
                    ProjectCard(project: project)
                }
                .buttonStyle(.plain)
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "folder.fill")
                .font(.system(size: 48))
                .foregroundStyle(.purple.opacity(0.5))
            Text("No projects yet").font(.headline)
            Text("Tap + to create a project").font(.subheadline).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity).padding(40)
    }
}

struct ProjectCard: View {
    let project: Project

    var accentColor: Color { Color(hex: project.colorHex) ?? .purple }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Circle()
                    .fill(accentColor)
                    .frame(width: 12, height: 12)
                Text(project.name)
                    .font(.headline)
                Spacer()
                Label(project.status.rawValue, systemImage: project.status.icon)
                    .font(.caption)
                    .foregroundStyle(Color(project.status.color))
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Color(project.status.color).opacity(0.1))
                    .clipShape(Capsule())
            }

            if !project.description.isEmpty {
                Text(project.description)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }

            VStack(spacing: 6) {
                HStack {
                    Text("\(project.tasks.filter(\.isCompleted).count)/\(project.tasks.count) tasks")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    Spacer()
                    Text("\(Int(project.completionPercentage * 100))%")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundStyle(accentColor)
                }
                ProgressView(value: project.completionPercentage)
                    .tint(accentColor)
            }

            HStack {
                if let deadline = project.deadline {
                    Label(deadline, style: .date)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                if !project.tags.isEmpty {
                    HStack(spacing: 4) {
                        ForEach(project.tags.prefix(3), id: \.self) { tag in
                            Text(tag)
                                .font(.caption2)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(accentColor.opacity(0.1))
                                .foregroundStyle(accentColor)
                                .clipShape(Capsule())
                        }
                    }
                }
            }
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

struct ProjectDetailView: View {
    @EnvironmentObject var store: DataStore
    @State var project: Project
    @State private var newTaskTitle = ""

    var accentColor: Color { Color(hex: project.colorHex) ?? .purple }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                statusHeader
                if !project.description.isEmpty {
                    descriptionSection
                }
                progressSection
                tasksSection
                metaSection
            }
            .padding()
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle(project.name)
        .navigationBarTitleDisplayMode(.large)
    }

    private var statusHeader: some View {
        HStack {
            Label(project.status.rawValue, systemImage: project.status.icon)
                .font(.subheadline)
                .foregroundStyle(Color(project.status.color))
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color(project.status.color).opacity(0.1))
                .clipShape(Capsule())

            Spacer()
            Menu {
                ForEach(ProjectStatus.allCases, id: \.self) { status in
                    Button(action: { updateStatus(status) }) {
                        Label(status.rawValue, systemImage: status.icon)
                    }
                }
            } label: {
                Text("Change status")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }

    private var descriptionSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("About").font(.headline)
            Text(project.description)
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private var progressSection: some View {
        VStack(spacing: 10) {
            HStack {
                Text("Progress").font(.headline)
                Spacer()
                Text("\(Int(project.completionPercentage * 100))%")
                    .font(.title3)
                    .fontWeight(.bold)
                    .foregroundStyle(accentColor)
            }
            ProgressView(value: project.completionPercentage)
                .tint(accentColor)
                .scaleEffect(y: 2)
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private var tasksSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Tasks").font(.headline)
            ForEach(project.tasks) { task in
                HStack(spacing: 12) {
                    Button(action: { toggleTask(taskId: task.id) }) {
                        Image(systemName: task.isCompleted ? "checkmark.circle.fill" : "circle")
                            .font(.title3)
                            .foregroundStyle(task.isCompleted ? accentColor : .secondary)
                    }
                    Text(task.title)
                        .strikethrough(task.isCompleted)
                        .foregroundStyle(task.isCompleted ? .secondary : .primary)
                    Spacer()
                }
                .padding(.vertical, 4)
                Divider()
            }

            HStack {
                TextField("New task...", text: $newTaskTitle)
                Button(action: addTask) {
                    Image(systemName: "plus.circle.fill")
                        .foregroundStyle(accentColor)
                }
                .disabled(newTaskTitle.trimmingCharacters(in: .whitespaces).isEmpty)
            }
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private var metaSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Info").font(.headline)
            HStack {
                Label("Started", systemImage: "calendar")
                Spacer()
                Text(project.startDate, style: .date).foregroundStyle(.secondary)
            }
            .font(.subheadline)
            if let deadline = project.deadline {
                HStack {
                    Label("Deadline", systemImage: "clock")
                    Spacer()
                    Text(deadline, style: .date)
                        .foregroundStyle(deadline < Date() ? .red : .secondary)
                }
                .font(.subheadline)
            }
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private func toggleTask(taskId: UUID) {
        store.toggleProjectTask(projectId: project.id, taskId: taskId)
        if let updated = store.projects.first(where: { $0.id == project.id }) {
            project = updated
        }
    }

    private func addTask() {
        let t = newTaskTitle.trimmingCharacters(in: .whitespaces)
        guard !t.isEmpty else { return }
        project.tasks.append(ProjectTask(title: t, isCompleted: false))
        store.updateProject(project)
        newTaskTitle = ""
    }

    private func updateStatus(_ status: ProjectStatus) {
        project.status = status
        store.updateProject(project)
    }
}

#Preview {
    NavigationStack {
        ProjectsView()
    }
    .environmentObject(DataStore.shared)
}
