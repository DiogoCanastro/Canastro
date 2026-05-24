import Foundation

enum WorkoutType: String, Codable, CaseIterable {
    case strength = "Strength"
    case cardio = "Cardio"
    case yoga = "Yoga"
    case hiit = "HIIT"
    case running = "Running"
    case cycling = "Cycling"
    case swimming = "Swimming"
    case other = "Other"

    var icon: String {
        switch self {
        case .strength: return "figure.strengthtraining.traditional"
        case .cardio: return "heart.circle"
        case .yoga: return "figure.mind.and.body"
        case .hiit: return "bolt.fill"
        case .running: return "figure.run"
        case .cycling: return "figure.outdoor.cycle"
        case .swimming: return "figure.pool.swim"
        case .other: return "sportscourt"
        }
    }
}

struct Exercise: Identifiable, Codable {
    var id = UUID()
    var name: String
    var sets: Int
    var reps: Int
    var weight: Double?
}

struct Workout: Identifiable, Codable {
    var id = UUID()
    var name: String
    var type: WorkoutType
    var durationMinutes: Int
    var date: Date
    var calories: Int?
    var notes: String
    var exercises: [Exercise]

    static let sample = Workout(
        name: "Morning Strength",
        type: .strength,
        durationMinutes: 60,
        date: Date(),
        calories: 420,
        notes: "Felt great today",
        exercises: [
            Exercise(name: "Bench Press", sets: 4, reps: 8, weight: 80),
            Exercise(name: "Squat", sets: 4, reps: 6, weight: 100)
        ]
    )
}
