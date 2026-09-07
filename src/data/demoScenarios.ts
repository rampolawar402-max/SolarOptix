export type ScenarioKey =
  | 'clean'
  | 'dust'
  | 'heavy_dust'
  | 'shading'
  | 'hotspot'
  | 'rain'
  | 'cloudy'
  | 'fault';

export interface ScenarioData {
  label: string;
  icon: string;
  powerOutput: number; // kW
  efficiency: number; // %
  soilingScore: number; // %
  energyLoss: number; // kWh
  avgTemp: number; // °C
  maxTemp: number; // °C
  minTemp: number; // °C
  hotspots: number;
  thermalAnomaly: 'LOW' | 'MEDIUM' | 'HIGH';
  rainProbability: number; // %
  humidity: number; // %
  cloudCoverage: number; // %
  windSpeed: number; // km/h
  weatherCondition: string;
  systemHealth: number; // %
  aiDecision: string;
  aiAction: 'CLEAN' | 'WAIT' | 'MONITOR' | 'INSPECT';
  aiReason: string;
  possibleCause: string;
  panelStatuses: ('normal' | 'reduced' | 'warning' | 'hotspot')[];
}

export const scenarios: Record<ScenarioKey, ScenarioData> = {
  clean: {
    label: 'Clean Panel',
    icon: '✦',
    powerOutput: 5.1,
    efficiency: 96,
    soilingScore: 4,
    energyLoss: 0.4,
    avgTemp: 38.2,
    maxTemp: 42.1,
    minTemp: 35.8,
    hotspots: 0,
    thermalAnomaly: 'LOW',
    rainProbability: 22,
    humidity: 48,
    cloudCoverage: 12,
    windSpeed: 14,
    weatherCondition: 'Sunny',
    systemHealth: 98,
    aiDecision: 'System operating at peak performance.',
    aiAction: 'MONITOR',
    aiReason: 'All metrics within optimal range. No action required.',
    possibleCause: 'None detected',
    panelStatuses: Array(20).fill('normal'),
  },
  dust: {
    label: 'Dust Accumulation',
    icon: '◌',
    powerOutput: 4.32,
    efficiency: 82,
    soilingScore: 64,
    energyLoss: 3.6,
    avgTemp: 44.8,
    maxTemp: 52.3,
    minTemp: 39.1,
    hotspots: 2,
    thermalAnomaly: 'MEDIUM',
    rainProbability: 18,
    humidity: 35,
    cloudCoverage: 8,
    windSpeed: 9,
    weatherCondition: 'Sunny',
    systemHealth: 82,
    aiDecision: 'Moderate soiling detected. Cleaning recommended.',
    aiAction: 'CLEAN',
    aiReason: 'Soiling score HIGH + Power loss HIGH + Rain probability LOW. Cleaning advised within 24 hours.',
    possibleCause: 'Dust / Surface Soiling',
    panelStatuses: [
      'normal','normal','reduced','normal','warning',
      'normal','reduced','reduced','normal','warning',
      'reduced','normal','normal','warning','normal',
      'reduced','normal','reduced','normal','normal',
    ],
  },
  heavy_dust: {
    label: 'Heavy Dust',
    icon: '▣',
    powerOutput: 3.28,
    efficiency: 68,
    soilingScore: 84,
    energyLoss: 6.8,
    avgTemp: 49.6,
    maxTemp: 58.9,
    minTemp: 42.3,
    hotspots: 5,
    thermalAnomaly: 'HIGH',
    rainProbability: 9,
    humidity: 28,
    cloudCoverage: 5,
    windSpeed: 6,
    weatherCondition: 'Sunny',
    systemHealth: 64,
    aiDecision: 'Critical soiling level. Immediate cleaning required.',
    aiAction: 'CLEAN',
    aiReason: 'Soiling score CRITICAL + Power loss SEVERE + Thermal anomaly HIGH + Rain probability VERY LOW.',
    possibleCause: 'Heavy Dust / Soiling Accumulation',
    panelStatuses: [
      'warning','hotspot','warning','warning','hotspot',
      'reduced','warning','hotspot','warning','reduced',
      'warning','warning','hotspot','reduced','warning',
      'hotspot','warning','reduced','warning','hotspot',
    ],
  },
  shading: {
    label: 'Partial Shading',
    icon: '◑',
    powerOutput: 3.85,
    efficiency: 76,
    soilingScore: 12,
    energyLoss: 4.1,
    avgTemp: 36.4,
    maxTemp: 44.2,
    minTemp: 32.1,
    hotspots: 0,
    thermalAnomaly: 'MEDIUM',
    rainProbability: 44,
    humidity: 62,
    cloudCoverage: 68,
    windSpeed: 18,
    weatherCondition: 'Partly Cloudy',
    systemHealth: 77,
    aiDecision: 'Power loss attributed to partial shading. No cleaning required.',
    aiAction: 'MONITOR',
    aiReason: 'Soiling score LOW but power loss MODERATE. Temperature patterns indicate shading, not dust.',
    possibleCause: 'Partial Shading / Cloud Variation',
    panelStatuses: [
      'normal','normal','normal','reduced','reduced',
      'normal','normal','reduced','reduced','warning',
      'normal','reduced','warning','reduced','normal',
      'normal','normal','reduced','normal','normal',
    ],
  },
  hotspot: {
    label: 'Hotspot',
    icon: '◉',
    powerOutput: 4.1,
    efficiency: 79,
    soilingScore: 22,
    energyLoss: 3.2,
    avgTemp: 52.8,
    maxTemp: 71.4,
    minTemp: 38.2,
    hotspots: 4,
    thermalAnomaly: 'HIGH',
    rainProbability: 14,
    humidity: 41,
    cloudCoverage: 18,
    windSpeed: 11,
    weatherCondition: 'Sunny',
    systemHealth: 71,
    aiDecision: 'Thermal anomaly detected. Panel inspection required.',
    aiAction: 'INSPECT',
    aiReason: 'Thermal anomaly HIGH but soiling score LOW. Pattern suggests cell fault or bypass diode failure — not dust.',
    possibleCause: 'Cell Fault / Bypass Diode Issue',
    panelStatuses: [
      'normal','normal','hotspot','normal','normal',
      'normal','hotspot','normal','normal','warning',
      'normal','normal','hotspot','normal','normal',
      'warning','normal','hotspot','normal','normal',
    ],
  },
  rain: {
    label: 'Rain',
    icon: '⌂',
    powerOutput: 1.84,
    efficiency: 58,
    soilingScore: 48,
    energyLoss: 5.2,
    avgTemp: 28.6,
    maxTemp: 33.1,
    minTemp: 25.4,
    hotspots: 0,
    thermalAnomaly: 'LOW',
    rainProbability: 88,
    humidity: 94,
    cloudCoverage: 92,
    windSpeed: 24,
    weatherCondition: 'Rainy',
    systemHealth: 88,
    aiDecision: 'Rain expected to naturally clean panels. Defer maintenance.',
    aiAction: 'WAIT',
    aiReason: 'Soiling score MODERATE + Power loss HIGH but rain probability VERY HIGH. Natural cleaning likely.',
    possibleCause: 'Weather / Low Irradiance',
    panelStatuses: [
      'reduced','reduced','reduced','reduced','reduced',
      'reduced','normal','reduced','reduced','reduced',
      'reduced','reduced','reduced','normal','reduced',
      'reduced','reduced','reduced','reduced','reduced',
    ],
  },
  cloudy: {
    label: 'Cloudy Weather',
    icon: '◎',
    powerOutput: 2.64,
    efficiency: 71,
    soilingScore: 18,
    energyLoss: 2.8,
    avgTemp: 31.2,
    maxTemp: 36.8,
    minTemp: 28.4,
    hotspots: 0,
    thermalAnomaly: 'LOW',
    rainProbability: 52,
    humidity: 78,
    cloudCoverage: 74,
    windSpeed: 16,
    weatherCondition: 'Overcast',
    systemHealth: 91,
    aiDecision: 'Reduced output due to cloud coverage. Monitor irradiance.',
    aiAction: 'MONITOR',
    aiReason: 'Power loss tied to cloud coverage. Soiling score LOW. No cleaning required.',
    possibleCause: 'Cloud Variation / Low Solar Irradiance',
    panelStatuses: [
      'normal','reduced','normal','reduced','normal',
      'reduced','normal','normal','reduced','normal',
      'normal','normal','reduced','normal','reduced',
      'normal','reduced','normal','normal','reduced',
    ],
  },
  fault: {
    label: 'Panel Fault',
    icon: '⚡',
    powerOutput: 3.92,
    efficiency: 74,
    soilingScore: 16,
    energyLoss: 4.4,
    avgTemp: 46.3,
    maxTemp: 78.6,
    minTemp: 36.2,
    hotspots: 6,
    thermalAnomaly: 'HIGH',
    rainProbability: 8,
    humidity: 32,
    cloudCoverage: 11,
    windSpeed: 7,
    weatherCondition: 'Sunny',
    systemHealth: 58,
    aiDecision: 'Critical panel fault detected. Immediate inspection required.',
    aiAction: 'INSPECT',
    aiReason: 'Multiple high-temperature hotspots with low soiling score. Electrical fault or PID degradation suspected.',
    possibleCause: 'Panel Fault / PID Degradation',
    panelStatuses: [
      'hotspot','normal','hotspot','warning','normal',
      'hotspot','normal','warning','hotspot','normal',
      'normal','hotspot','normal','normal','hotspot',
      'warning','hotspot','normal','warning','hotspot',
    ],
  },
};

export const defaultScenario: ScenarioKey = 'dust';
