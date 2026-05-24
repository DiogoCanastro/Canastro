import Foundation

struct HealthMetric: Identifiable, Codable {
    var id = UUID()
    var date: Date
    var weightKg: Double?
    var steps: Int?
    var heartRateBpm: Int?
    var waterLiters: Double?
    var caloriesConsumed: Int?

    static let sample = HealthMetric(
        date: Date(),
        weightKg: 78.5,
        steps: 9200,
        heartRateBpm: 62,
        waterLiters: 2.5,
        caloriesConsumed: 2100
    )
}
