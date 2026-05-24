import Foundation

enum GoalCategory: String, Codable, CaseIterable {
    case fitness = "Fitness"
    case health = "Health"
    case personal = "Personal"
    case professional = "Professional"
    case financial = "Financial"
    case learning = "Learning"

    var icon: String {
        switch self {
        case .fitness: return "figure.run"
        case .health: return "heart.fill"
        case .personal: return "person.fill"
        case .professional: return "briefcase.fill"
        case .financial: return "dollarsign.circle.fill"
        case .learning: return "book.fill"
        }
    }

    var color: String {
        switch self {
        case .fitness: return "orange"
        case .health: return "red"
        case .personal: return "purple"
        case .professional: return "blue"
        case .financial: return "green"
        case .learning: return "teal"
        }
    }
}

struct Goal: Identifiable, Codable {
    var id = UUID()
    var title: String
    var description: String
    var category: GoalCategory
    var targetValue: Double
    var currentValue: Double
    var unit: String
    var deadline: Date?
    var isCompleted: Bool
    var createdAt: Date

    var progress: Double {
        guard targetValue > 0 else { return 0 }
        return min(currentValue / targetValue, 1.0)
    }

    static let sample = Goal(
        title: "Run 100km this month",
        description: "Build up running endurance",
        category: .fitness,
        targetValue: 100,
        currentValue: 42,
        unit: "km",
        deadline: Calendar.current.date(byAdding: .month, value: 1, to: Date()),
        isCompleted: false,
        createdAt: Date()
    )
}
