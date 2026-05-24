import SwiftUI

struct ProductivityView: View {
    var body: some View {
        NavigationStack {
            List {
                NavigationLink(destination: TodoView()) {
                    Label("To-Do List", systemImage: "checkmark.circle.fill")
                        .foregroundStyle(.blue)
                }
                NavigationLink(destination: ProjectsView()) {
                    Label("Projects", systemImage: "folder.fill")
                        .foregroundStyle(.purple)
                }
            }
            .navigationTitle("Productivity")
        }
    }
}

// MARK: - To-Do View

struct TodoView: View {
    @EnvironmentObject var store: DataStore
    @State private var showAdd = false
    @State private var showCompleted = false

    var pendingItems: [TodoItem] { store.todoItems.filter { !$0.isCompleted } }
    var completedItems: [TodoItem] { store.todoItems.filter { $0.isCompleted } }

    var sortedPending: [TodoItem] {
        pendingItems.sorted {
            let p0 = Priority.allCases.firstIndex(of: $0.priority) ?? 0
            let p1 = Priority.allCases.firstIndex(of: $1.priority) ?? 0
            return p0 > p1
        }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                todoSummary
                if sortedPending.isEmpty && completedItems.isEmpty {
                    emptyState
                } else {
                    pendingSection
                    if !completedItems.isEmpty {
                        completedToggle
                        if showCompleted {
                            completedSection
                        }
                    }
                }
            }
            .padding()
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("To-Do")
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button(action: { showAdd = true }) {
                    Image(systemName: "plus.circle.fill").font(.title3)
                }
            }
        }
        .sheet(isPresented: $showAdd) {
            AddTodoView()
        }
    }

    private var todoSummary: some View {
        HStack(spacing: 0) {
            SummaryCell(value: "\(pendingItems.count)", label: "Open", icon: "circle", color: .blue)
            Divider().frame(height: 40)
            SummaryCell(
                value: "\(pendingItems.filter { $0.priority == .urgent || $0.priority == .high }.count)",
                label: "High priority",
                icon: "exclamationmark.circle",
                color: .red
            )
            Divider().frame(height: 40)
            SummaryCell(value: "\(completedItems.count)", label: "Done", icon: "checkmark.circle.fill", color: .green)
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }

    private var pendingSection: some View {
        LazyVStack(spacing: 10) {
            ForEach(sortedPending) { item in
                TodoRow(item: item)
            }
        }
    }

    private var completedToggle: some View {
        Button(action: { withAnimation { showCompleted.toggle() } }) {
            HStack {
                Text("Completed (\(completedItems.count))")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                Spacer()
                Image(systemName: showCompleted ? "chevron.up" : "chevron.down")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .padding(.horizontal, 4)
        }
    }

    private var completedSection: some View {
        LazyVStack(spacing: 10) {
            ForEach(completedItems) { item in
                TodoRow(item: item)
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 48))
                .foregroundStyle(.blue.opacity(0.5))
            Text("All clear!").font(.headline)
            Text("Tap + to add a task").font(.subheadline).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity).padding(40)
    }
}

struct TodoRow: View {
    @EnvironmentObject var store: DataStore
    let item: TodoItem

    var body: some View {
        HStack(spacing: 12) {
            Button(action: { store.toggleTodo(id: item.id) }) {
                Image(systemName: item.isCompleted ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundStyle(item.isCompleted ? .green : Color(item.priority.color))
            }
            VStack(alignment: .leading, spacing: 4) {
                Text(item.title)
                    .font(.subheadline)
                    .strikethrough(item.isCompleted)
                    .foregroundStyle(item.isCompleted ? .secondary : .primary)
                if !item.notes.isEmpty && !item.isCompleted {
                    Text(item.notes)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
                if let due = item.dueDate, !item.isCompleted {
                    HStack(spacing: 4) {
                        Image(systemName: "calendar").font(.caption2)
                        Text(due, style: .date).font(.caption)
                    }
                    .foregroundStyle(due < Date() ? .red : .secondary)
                }
            }
            Spacer()
            if !item.isCompleted {
                Image(systemName: item.priority.icon)
                    .foregroundStyle(Color(item.priority.color))
                    .font(.caption)
            }
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .opacity(item.isCompleted ? 0.6 : 1)
    }
}

#Preview {
    ProductivityView().environmentObject(DataStore.shared)
}
