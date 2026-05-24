import Foundation

enum SleepQuality: String, Codable, CaseIterable {
    case poor = "Poor"
    case fair = "Fair"
    case good = "Good"
    case excellent = "Excellent"

    var icon: String {
        switch self {
        case .poor: return "moon"
        case .fair: return "moon.fill"
        case .good: return "moon.stars.fill"
        case .excellent: return "sparkles"
        }
    }

    var color: String {
        switch self {
        case .poor: return "red"
        case .fair: return "orange"
        case .good: return "blue"
        case .excellent: return "indigo"
        }
    }
}

struct SleepEntry: Identifiable, Codable {
    var id = UUID()
    var date: Date
    var bedtime: Date
    var wakeTime: Date
    var quality: SleepQuality
    var notes: String

    var durationHours: Double {
        max(wakeTime.timeIntervalSince(bedtime) / 3600, 0)
    }

    static let sample: SleepEntry = {
        let cal = Calendar.current
        let today = cal.startOfDay(for: Date())
        let bed = cal.date(byAdding: .hour, value: -8, to: today)!
        let wake = cal.date(byAdding: .minute, value: 30, to: today)!
        return SleepEntry(date: today, bedtime: bed, wakeTime: wake, quality: .good, notes: "")
    }()
}
