export interface Workout {
  id: string;
  date: string;
  type: string;
  name: string;
  duration: number; // seconds
  distance?: number; // meters
  calories?: number;
  avgHeartRate?: number;
  elevationGain?: number;
  source: 'manual' | 'strava';
  stravaId?: number;
}

export interface HealthMetric {
  id: string;
  date: string;
  type: 'weight' | 'heartRate' | 'bloodPressure' | 'steps' | 'custom';
  value: number;
  unit: string;
  label: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: 'fitness' | 'health' | 'personal' | 'work' | 'other';
  target: number;
  current: number;
  unit: string;
  deadline?: string;
  completed: boolean;
  createdAt: string;
}

export interface SleepEntry {
  id: string;
  date: string;
  bedTime: string;
  wakeTime: string;
  duration: number; // hours
  quality: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: string;
  createdAt: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'paused' | 'completed';
  progress: number;
  color: string;
  tags: string[];
  tasks: ProjectTask[];
  createdAt: string;
  updatedAt: string;
}

export interface StravaTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  athleteId: number;
  athleteName: string;
  athleteAvatar?: string;
}

export interface StravaActivity {
  id: number;
  name: string;
  sport_type: string;
  start_date: string;
  elapsed_time: number;
  moving_time: number;
  distance: number;
  total_elevation_gain: number;
  average_heartrate?: number;
  max_heartrate?: number;
  calories?: number;
}
