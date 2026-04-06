
export type OtherMetricType = 'B%' | 'GMV' | 'TSH' | 'rides' | '未应答%';

export interface ForecastDataPoint {
  hour: number; // 0-23
  fullDate: string; // YYYY-MM-DD
  absoluteIndex: number; // 0 to (days * 24 - 1)
  
  // Main metric (e.g., Completion Rate)
  value: number; 
  // Comparison values
  valueL4W: number; // Last 4 Weeks Avg
  valueLastWeek: number; // Last Week Same Day
  valueCustom: number; // Custom Date
  valueAlgo: number; // Algorithm Prediction
  
  // Other metrics
  calls: number;
  driverTsh: number;
  bPercent?: number;
  gmv?: number;
  tsh?: number;
  rides?: number;
  unansweredPercent?: number;
  
  predictedDemand: number;
  predictedSupply: number;
  
  // Pre-calculated status for UI coloring
  status: ShortageLevel;
  statusL4W: ShortageLevel;
  statusLastWeek: ShortageLevel;
  statusCustom: ShortageLevel;
  statusAlgo: ShortageLevel;
}

export interface CityRow {
  id: string;
  cityName: string;
  districtName?: string; // Added for Split District view
  category: string;
  date: string; // Start date
  hourlyData: ForecastDataPoint[];
}

export interface FenceHourlyPoint {
  hour: number;
  fullDate: string;
  absoluteIndex: number;
  
  // Main Metric: CR
  cr: number; 
  crAlgo: number;
  crL4W: number;
  crLastWeek: number;
  crCustom: number;
  
  // Diagnostic Metric 1: Impact
  impact: number; // Impact on Pan-Express CR (pp)
  impactAlgo: number;
  impactL4W: number;
  impactLastWeek: number;
  impactCustom: number;

  // Diagnostic Metric 2: Unanswered
  unanswered: number; // Unanswered Orders count
  unansweredAlgo: number;
  unansweredL4W: number;
  unansweredLastWeek: number;
  unansweredCustom: number;

  // Diagnostic Metric 3: Calls
  calls: number;
  callsAlgo: number;
  callsL4W: number;
  callsLastWeek: number;
  callsCustom: number;
  
  // Other Metrics
  bPercent?: number;
  gmv?: number;
  tsh?: number;
  rides?: number;
  unansweredPercent?: number;

  status: ShortageLevel;
}

export interface FenceRow {
  id: string;
  cityName: string;
  fenceName: string;
  fenceType: '人工' | '算法'; // Manual or Algorithm
  category: string;
  date: string;
  hourlyData: FenceHourlyPoint[];
}

export interface EventItem {
  id: string;
  city: string;
  district?: string; // Added: District where the event occurs
  type: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  timeSlot: string;
  impactCount: string;
  impactDetail: string; 
  demandForecast: string; 
  severity: '高' | '中' | '低';
  severityReasoning: string; // 新增：严重程度推理原因
  recentSimilarEvents: string; // 新增：近期同类事件发生城市or日期
  isMarked: boolean; // 新增：是否标记到表格
  interventionStrategy: string; 
  strategySuggestion?: string; // 新增：策略建议
}

export interface StrategyItem {
  id: string;
  city: string;
  fence: string;
  category: string;
  date: string;
  timeSlot: string;
  userGroup: string;
  tactic: string;
  rule: string;
  acquisitionMethod: string;
  cost: number;
  estBudget: number;
  estSubsidyRate: number;
  source: string;
  event: string;
  status: string;
}

export interface BatchStrategyItem {
  id: string;
  date: string;
  timeSlot: string;
  city: string;
  fence: string;
  category: string;
  userGroup: string;
  tactic: string;
  rule: string;
  acquisitionMethod: string;
  source: string;
  submitter: string;
  submitTime: string;
  status: '初始化' | '待审核' | '待生效' | '生效中' | '已结束';
}

export interface HistoryStrategyItem {
  activityId: string;
  city: string;
  dateRange: string;
  timeSlot: string;
  fenceId: string;
  category: string;
  tool: string;
  rewardConfig: string;
  method: string;
  userGroup: string;
  participants: string;
  participationRate: string;
  writeOffAmount: number;
  citySubsidyRate: string;
  panSubsidyRate: string;
  roi: number;
}

// Added interfaces for Strategy Automation Rules used in StrategyConfigModal
export interface StrategyTrigger {
  metric: string;
  operator: string;
  value: number;
  unit: string;
  logic: string;
}

export interface StrategyConfig {
  tool: string;
  method: string;
  userGroup: string;
  fenceId: string;
  displayText: string;
}

export interface CalculationConfig {
  mode: 'manual' | 'calculator';
  manualAmount?: number;
  refDate?: string;
  coefficient?: number;
}

// Fixed missing StrategyRule interface
export interface StrategyRule {
  id: string;
  name: string;
  cities: string[];
  category: string;
  isActive: boolean;
  triggers: StrategyTrigger[];
  strategy: StrategyConfig;
  calculation: CalculationConfig;
  updatedAt: string;
  updatedBy: string;
}

export enum ShortageLevel {
  SEVERE = 'SEVERE', // < 75%
  MODERATE = 'MODERATE', // 75% - 85%
  NORMAL = 'NORMAL', // > 85%
}

export type MetricType = 'rate' | 'calls' | 'tsh';
export type ComparisonType = 'l4w' | 'lastWeek' | 'custom';
export type FenceMetricType = 'cr' | 'impact' | 'unanswered';
