import Foundation

enum ProjectStatus: String, Codable, CaseIterable {
    case planning = "Planning"
    case active = "Active"
    case paused = "Paused"
    case completed = "Completed"
    case archived = "Archived"

    var icon: String {
        switch self {
        case .planning: return "pencil.circle"
        case .active: return "play.circle.fill"
        case .paused: return "pause.circle.fill"
        case .completed: return "checkmark.circle.fill"
        case .archived: return "archivebox.fill"
        }
    }

    var color: String {
        switch self {
        case .planning: return "gray"
        case .active: return "blue"
        case .paused: return "orange"
        case .completed: return "green"
        case .archived: return "secondary"
        }
    }
}

struct ProjectTask: Identifiable, Codable {
    var id = UUID()
    var title: String
    var isCompleted: Bool
    var dueDate: Date?
}

struct Project: Identifiable, Codable {
    var id = UUID()
    var name: String
    var description: String
    var status: ProjectStatus
    var startDate: Date
    var deadline: Date?
    var tasks: [ProjectTask]
    var colorHex: String
    var tags: [String]

    var completionPercentage: Double {
        guard !tasks.isEmpty else { return 0 }
        let done = tasks.filter(\.isCompleted).count
        return Double(done) / Double(tasks.count)
    }

    static let sample = Project(
        name: "Canastro iOS App",
        description: "Personal productivity dashboard for iOS",
        status: .active,
        startDate: Date(),
        deadline: Calendar.current.date(byAdding: .month, value: 2, to: Date()),
        tasks: [
            ProjectTask(title: "Design UI", isCompleted: true),
            ProjectTask(title: "Build models", isCompleted: true),
            ProjectTask(title: "Implement views", isCompleted: false),
            ProjectTask(title: "Add data persistence", isCompleted: false)
        ],
        colorHex: "5E5CE6",
        tags: ["iOS", "SwiftUI", "personal"]
    )
}
