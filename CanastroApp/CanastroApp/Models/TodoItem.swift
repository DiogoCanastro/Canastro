import Foundation

enum Priority: String, Codable, CaseIterable {
    case low = "Low"
    case medium = "Medium"
    case high = "High"
    case urgent = "Urgent"

    var icon: String {
        switch self {
        case .low: return "arrow.down.circle"
        case .medium: return "minus.circle"
        case .high: return "arrow.up.circle"
        case .urgent: return "exclamationmark.circle.fill"
        }
    }

    var color: String {
        switch self {
        case .low: return "gray"
        case .medium: return "blue"
        case .high: return "orange"
        case .urgent: return "red"
        }
    }
}

struct TodoItem: Identifiable, Codable {
    var id = UUID()
    var title: String
    var notes: String
    var priority: Priority
    var dueDate: Date?
    var isCompleted: Bool
    var createdAt: Date
    var completedAt: Date?
    var tags: [String]

    static let sample = TodoItem(
        title: "Review quarterly goals",
        notes: "Check progress on all active goals",
        priority: .high,
        dueDate: Calendar.current.date(byAdding: .day, value: 2, to: Date()),
        isCompleted: false,
        createdAt: Date(),
        tags: ["planning", "goals"]
    )
}
