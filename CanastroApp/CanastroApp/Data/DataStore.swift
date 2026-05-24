import Foundation
import Combine

class DataStore: ObservableObject {
    static let shared = DataStore()

    @Published var workouts: [Workout] = [] { didSet { save(workouts, key: "workouts") } }
    @Published var healthMetrics: [HealthMetric] = [] { didSet { save(healthMetrics, key: "healthMetrics") } }
    @Published var goals: [Goal] = [] { didSet { save(goals, key: "goals") } }
    @Published var sleepEntries: [SleepEntry] = [] { didSet { save(sleepEntries, key: "sleepEntries") } }
    @Published var todoItems: [TodoItem] = [] { didSet { save(todoItems, key: "todoItems") } }
    @Published var projects: [Project] = [] { didSet { save(projects, key: "projects") } }

    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()

    init() {
        workouts = load(key: "workouts") ?? [.sample]
        healthMetrics = load(key: "healthMetrics") ?? [.sample]
        goals = load(key: "goals") ?? [.sample]
        sleepEntries = load(key: "sleepEntries") ?? [.sample]
        todoItems = load(key: "todoItems") ?? [.sample]
        projects = load(key: "projects") ?? [.sample]
    }

    private func save<T: Encodable>(_ value: T, key: String) {
        if let data = try? encoder.encode(value) {
            UserDefaults.standard.set(data, forKey: key)
        }
    }

    private func load<T: Decodable>(key: String) -> T? {
        guard let data = UserDefaults.standard.data(forKey: key) else { return nil }
        return try? decoder.decode(T.self, from: data)
    }

    // MARK: - Workouts
    func addWorkout(_ workout: Workout) {
        workouts.insert(workout, at: 0)
    }

    func deleteWorkouts(at offsets: IndexSet) {
        workouts.remove(atOffsets: offsets)
    }

    func updateWorkout(_ workout: Workout) {
        if let i = workouts.firstIndex(where: { $0.id == workout.id }) {
            workouts[i] = workout
        }
    }

    // MARK: - Health
    func addHealthMetric(_ metric: HealthMetric) {
        healthMetrics.insert(metric, at: 0)
    }

    func deleteHealthMetrics(at offsets: IndexSet) {
        healthMetrics.remove(atOffsets: offsets)
    }

    // MARK: - Goals
    func addGoal(_ goal: Goal) {
        goals.append(goal)
    }

    func deleteGoals(at offsets: IndexSet) {
        goals.remove(atOffsets: offsets)
    }

    func updateGoal(_ goal: Goal) {
        if let i = goals.firstIndex(where: { $0.id == goal.id }) {
            goals[i] = goal
        }
    }

    // MARK: - Sleep
    func addSleepEntry(_ entry: SleepEntry) {
        sleepEntries.insert(entry, at: 0)
    }

    func deleteSleepEntries(at offsets: IndexSet) {
        sleepEntries.remove(atOffsets: offsets)
    }

    // MARK: - Todo
    func addTodo(_ item: TodoItem) {
        todoItems.append(item)
    }

    func deleteTodos(at offsets: IndexSet) {
        todoItems.remove(atOffsets: offsets)
    }

    func toggleTodo(id: UUID) {
        if let i = todoItems.firstIndex(where: { $0.id == id }) {
            todoItems[i].isCompleted.toggle()
            todoItems[i].completedAt = todoItems[i].isCompleted ? Date() : nil
        }
    }

    func updateTodo(_ item: TodoItem) {
        if let i = todoItems.firstIndex(where: { $0.id == item.id }) {
            todoItems[i] = item
        }
    }

    // MARK: - Projects
    func addProject(_ project: Project) {
        projects.append(project)
    }

    func deleteProjects(at offsets: IndexSet) {
        projects.remove(atOffsets: offsets)
    }

    func updateProject(_ project: Project) {
        if let i = projects.firstIndex(where: { $0.id == project.id }) {
            projects[i] = project
        }
    }

    func toggleProjectTask(projectId: UUID, taskId: UUID) {
        if let pi = projects.firstIndex(where: { $0.id == projectId }),
           let ti = projects[pi].tasks.firstIndex(where: { $0.id == taskId }) {
            projects[pi].tasks[ti].isCompleted.toggle()
        }
    }
}
