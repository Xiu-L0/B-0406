import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FilterBar } from './components/FilterBar';
import { ForecastTable } from './components/ForecastTable';
import { ForecastChart } from './components/ForecastChart';
import { FenceForecastTable } from './components/FenceForecastTable';
import { StrategyTable, StrategyRow } from './components/StrategyTable';
import { HistoryStrategyTable } from './components/HistoryStrategyTable';
import { EventMonitorTable, MOCK_EVENTS as BASE_MOCK_EVENTS } from './components/EventMonitorTable';
import { FenceMapDrawer } from './components/FenceMapDrawer';
import { DiagnosticRulesModal, DiagnosticScenario } from './components/DiagnosticRulesModal';
import { MainCityUploadModal } from './components/MainCityUploadModal';
import { StrategyConfigModal } from './components/StrategyConfigModal';
import { ActiveRulesModal } from './components/ActiveRulesModal';
import { BatchStrategyPage } from './components/BatchStrategyPage';
import { BatchAuditPage } from './components/BatchAuditPage';
import { AIChatDrawer } from './components/AIChatDrawer'; 
import { Icons } from './components/Icons';
import { OtherMetricsDropdown } from './components/OtherMetricsDropdown';
import { CityRow, StrategyItem, MetricType, ComparisonType, ShortageLevel, FenceRow, HistoryStrategyItem, FenceMetricType, EventItem, FenceHourlyPoint, BatchStrategyItem } from './types';

// --- DISTRICT DATA ---
const CITY_DISTRICTS: Record<string, string[]> = {
  '保定市': ['竞秀区', '莲池区', '满城区', '清苑区', '徐水区'],
  '滨州市': ['滨城区', '沾化区', '惠民县', '阳信县', '无棣县'],
  '常州市': ['天宁区', '钟楼区', '新北区', '武进区', '金坛区'],
  '大连市': ['中山区', '西岗区', '沙河口区', '甘井子区', '旅顺口区', '金州区'],
  '大同市': ['平城区', '云冈区', '新荣区', '云州区']
};

// --- REAL DATA FROM IMAGES ---
const getTomorrow = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const getDayAfterTomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return date.toISOString().split('T')[0];
};

const getTwoDaysAfterTomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return date.toISOString().split('T')[0];
};

const TOMORROW = getTomorrow();
const DAY_AFTER_TOMORROW = getDayAfterTomorrow();
const TWO_DAYS_AFTER_TOMORROW = getTwoDaysAfterTomorrow();

const ALL_CITIES = ['保定市', '滨州市', '常州市', '大连市', '大同市', '淮安市', '济南市', '廊坊市', '聊城市', '临沂市', '南京市', '南通市', '秦皇岛市', '青岛市', '日照市', '沈阳市', '石家庄市'];

const REAL_CR_DATA: Record<string, Record<number, { pan: number, special: number }>> = {
  '保定市': {
    0: { pan: 79.21, special: 65.56 }, 1: { pan: 78.46, special: 61.21 }, 2: { pan: 71.50, special: 51.76 },
    3: { pan: 74.29, special: 54.01 }, 4: { pan: 57.33, special: 31.33 }, 5: { pan: 75.84, special: 56.43 },
    6: { pan: 84.18, special: 75.40 }, 7: { pan: 82.25, special: 74.86 }, 8: { pan: 82.38, special: 75.80 },
    9: { pan: 86.31, special: 80.99 }, 10: { pan: 85.67, special: 79.96 }, 11: { pan: 83.95, special: 76.99 },
    12: { pan: 80.96, special: 73.02 }, 13: { pan: 82.95, special: 71.09 }, 14: { pan: 82.74, special: 74.70 },
  },
  '滨州市': {
    0: { pan: 74.19, special: 58.51 }, 1: { pan: 87.34, special: 89.02 }, 2: { pan: 83.91, special: 83.82 },
    3: { pan: 85.08, special: 86.30 }, 4: { pan: 35.27, special: 17.61 }, 5: { pan: 83.56, special: 84.69 },
    6: { pan: 88.23, special: 86.07 }, 7: { pan: 92.74, special: 92.93 }, 8: { pan: 88.89, special: 87.36 },
    9: { pan: 91.81, special: 91.86 }, 10: { pan: 88.93, special: 88.37 }, 11: { pan: 88.13, special: 85.32 },
    12: { pan: 90.18, special: 89.82 }, 13: { pan: 88.39, special: 86.03 }, 14: { pan: 87.44, special: 86.66 },
  },
  '常州市': {
    0: { pan: 81.31, special: 78.40 }, 1: { pan: 90.22, special: 85.72 }, 2: { pan: 85.12, special: 84.10 },
    3: { pan: 85.18, special: 83.20 }, 4: { pan: 83.78, special: 83.78 }, 5: { pan: 85.72, special: 83.73 },
    6: { pan: 51.41, special: 22.80 }, 7: { pan: 39.47, special: 10.16 }, 8: { pan: 90.22, special: 92.74 },
    9: { pan: 91.41, special: 88.28 }, 10: { pan: 88.98, special: 88.56 }, 11: { pan: 90.31, special: 88.35 },
    12: { pan: 87.25, special: 88.99 }, 13: { pan: 87.08, special: 89.23 }, 14: { pan: 90.72, special: 88.22 },
  },
  '大连市': {
    0: { pan: 81.24, special: 77.43 }, 1: { pan: 87.87, special: 88.61 }, 2: { pan: 85.33, special: 84.89 },
    3: { pan: 82.97, special: 84.49 }, 4: { pan: 85.07, special: 85.67 }, 5: { pan: 84.67, special: 86.17 },
    6: { pan: 88.32, special: 89.38 }, 7: { pan: 93.16, special: 90.61 }, 8: { pan: 92.88, special: 90.08 },
    9: { pan: 90.83, special: 91.65 }, 10: { pan: 88.80, special: 89.51 }, 11: { pan: 87.55, special: 86.13 },
    12: { pan: 87.60, special: 89.09 }, 13: { pan: 87.30, special: 88.92 }, 14: { pan: 86.21, special: 87.59 },
  },
  '大同市': {
    0: { pan: 83.96, special: 83.96 }, 1: { pan: 85.74, special: 85.74 }, 2: { pan: 82.64, special: 82.64 },
    3: { pan: 81.52, special: 81.52 }, 4: { pan: 81.61, special: 81.61 }, 5: { pan: 82.03, special: 82.03 },
    6: { pan: 88.20, special: 88.20 }, 7: { pan: 88.90, special: 88.90 }, 8: { pan: 90.11, special: 90.11 },
    9: { pan: 90.23, special: 90.23 }, 10: { pan: 87.66, special: 87.66 }, 11: { pan: 85.65, special: 85.65 },
    12: { pan: 87.57, special: 87.57 }, 13: { pan: 84.55, special: 84.55 }, 14: { pan: 87.54, special: 87.54 },
  }
};

const ATTENTION_EVENTS: EventItem[] = [
  { 
    id: '1', 
    city: '保定市', 
    district: '竞秀区',
    type: '演唱会', 
    name: '演唱会-保定巡演', 
    location: '保定体育场', 
    startDate: TOMORROW, 
    endDate: TOMORROW, 
    timeSlot: '18:00-22:00', 
    impactCount: '5.5w', 
    impactDetail: '大麦想看人数超过10W', 
    demandForecast: '+65%', 
    severity: '高',
    severityReasoning: '核心场馆满座，周边交通管制，历史同期规模增量显著',
    recentSimilarEvents: '保定 (2025-10)',
    isMarked: true,
    interventionStrategy: '建议开启热点区域围栏激励',
    strategySuggestion: '散场【必须】【增加围栏策略】；晚峰【必须】【升级全城/主城】'
  },
  { 
    id: '2', 
    city: '大连市', 
    district: '中山区',
    type: '大型赛事', 
    name: '赛事-冬季运动会', 
    location: '大连体育中心', 
    startDate: TOMORROW, 
    endDate: TOMORROW, 
    timeSlot: '08:00-18:00', 
    impactCount: '3w', 
    impactDetail: '专业体育赛事', 
    demandForecast: '+40%', 
    severity: '低',
    severityReasoning: '赛事周期长，人流分散，对全城供需冲击较小',
    recentSimilarEvents: '沈阳 (2025-12)',
    isMarked: false,
    interventionStrategy: '常规运力保障',
    strategySuggestion: '早高峰【必须】【增加围栏策略】；午间【非必须】【有预算的情况加补】'
  },
  { 
    id: '3', 
    city: '常州市', 
    district: '新北区',
    type: '天气', 
    name: '天气-中雪预警', 
    location: '全市范围', 
    startDate: TOMORROW, 
    endDate: TOMORROW, 
    timeSlot: '全天', 
    impactCount: '全市', 
    impactDetail: '强降温及积雪', 
    demandForecast: '+80%', 
    severity: '高',
    severityReasoning: '全市范围强降温，司机出勤率预计下降40%，需求激增',
    recentSimilarEvents: '徐州 (2025-12)',
    isMarked: true,
    interventionStrategy: '全城极端天气B补方案',
    strategySuggestion: '全天【必须】【运力出勤补贴】；晚峰【必须】【升级全城/主城】'
  },
  { 
    id: '4', 
    city: '滨州市', 
    district: '滨城区',
    type: '展会活动', 
    name: '展会-年货大集', 
    location: '滨州国际会展中心', 
    startDate: TOMORROW, 
    endDate: TOMORROW, 
    timeSlot: '09:00-17:00', 
    impactCount: '4.2w', 
    impactDetail: '本地传统集市', 
    demandForecast: '+30%', 
    severity: '低',
    severityReasoning: '展会规模一般，周边酒店运力充足',
    recentSimilarEvents: '无锡 (2025-01)',
    isMarked: false,
    interventionStrategy: '区域调度补',
    strategySuggestion: '午峰【非必须】【有预算的情况加补】'
  },
  { 
    id: '5', 
    city: '大同市', 
    district: '平城区',
    type: '大型考试', 
    name: '考试-公务员省考', 
    location: '大同各考点', 
    startDate: TOMORROW, 
    endDate: TOMORROW, 
    timeSlot: '07:30-17:00', 
    impactCount: '2.5w', 
    impactDetail: '标准化考试', 
    demandForecast: '+25%', 
    severity: '低',
    severityReasoning: '考点分散，早晚高峰压力略增',
    recentSimilarEvents: '太原 (2025-03)',
    isMarked: false,
    interventionStrategy: '考点周边运力引导',
    strategySuggestion: '早晚高峰【必须】【增加围栏策略】'
  }
];

// --- MOCK DATA GENERATION ---
const getStatus = (val: number, threshold: number): ShortageLevel => {
  if (val < threshold) return ShortageLevel.SEVERE;
  if (val < threshold + 5) return ShortageLevel.MODERATE; 
  return ShortageLevel.NORMAL;
};

const addDays = (dateStr: string, days: number): string => {
  const result = new Date(dateStr);
  result.setDate(result.getDate() + days);
  return result.toISOString().split('T')[0];
};

const getDayCount = (start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(1, Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
};

const generateHourlyData = (cityName: string, cityMultiplier: number, category: string, selectedDates: string[], threshold: number) => {
  const totalHours = selectedDates.length * 24;
  return Array.from({ length: totalHours }, (_, index) => {
    const hour = index % 24;
    const dateIndex = Math.floor(index / 24);
    const dateStr = selectedDates[dateIndex];
    
    let val = 0;
    const realCityData = dateIndex === 0 ? REAL_CR_DATA[cityName]?.[hour] : undefined;
    
    if (realCityData) {
      val = category === '泛快' ? realCityData.pan : realCityData.special;
    } else {
      const isPeak = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
      const isNight = hour >= 2 && hour <= 5;
      const baseRate = isNight ? (85 + cityMultiplier) : (isPeak ? 92 : 89) + cityMultiplier;
      val = Math.min(100, Math.max(0, baseRate + (Math.random() * 4 - 2)));
    }
    
    const valAlgo = Math.min(100, Math.max(0, val + 1.2 + (Math.random() * 1.5 - 0.75)));
    const valL4W = Math.min(100, Math.max(0, val - 1.5 + (Math.random() * 2 - 1)));
    const valLastWeek = Math.min(100, Math.max(0, val + 0.3 + (Math.random() * 2 - 1)));

    return {
      hour, fullDate: dateStr, absoluteIndex: index,
      value: Number(val.toFixed(2)), valueAlgo: Number(valAlgo.toFixed(2)),
      valueL4W: Number(valL4W.toFixed(2)), valueLastWeek: Number(valLastWeek.toFixed(2)),
      valueCustom: Number(val.toFixed(2)),
      calls: Math.floor((1200 + Math.random() * 600) * (category === '泛快' ? 1 : 0.7)),
      driverTsh: 25 + Math.random() * 15,
      bPercent: 0.45 + Math.random() * 0.15,
      gmv: 45000 + Math.random() * 10000,
      tsh: 28 + Math.random() * 5,
      rides: 850 + Math.random() * 200,
      unansweredPercent: 1.5 + Math.random() * 2,
      predictedDemand: 1000, predictedSupply: 850,
      status: getStatus(val, threshold),
      statusAlgo: getStatus(valAlgo, threshold),
      statusL4W: getStatus(valL4W, threshold),
      statusLastWeek: getStatus(valLastWeek, threshold),
      statusCustom: getStatus(val, threshold),
    };
  });
};

const generateMockForecast = (cities: string[], cityRegionMode: 'all' | 'main' | 'district', selectedDates: string[], threshold: number): CityRow[] => {
  const actualCities = cities.includes('全部') 
    ? ALL_CITIES
    : cities;

  return actualCities.flatMap(city => {
    const districts = cityRegionMode === 'district' ? (CITY_DISTRICTS[city] || [undefined]) : [undefined]; 
    return districts.flatMap(district => {
      const multiplier = Math.random() * 2 - (cityRegionMode === 'main' ? 0.5 : 1); // 主城模式数据略有不同
      return [
        { id: `row-${city}-${district || 'full'}-f`, cityName: city, districtName: district, category: '泛快', date: selectedDates[0], hourlyData: generateHourlyData(city, multiplier, '泛快', selectedDates, threshold) },
        { id: `row-${city}-${district || 'full'}-t`, cityName: city, districtName: district, category: '特惠', date: selectedDates[0], hourlyData: generateHourlyData(city, multiplier, '特惠', selectedDates, threshold) },
        { id: `row-${city}-${district || 'full'}-j`, cityName: city, districtName: district, category: '惊喜', date: selectedDates[0], hourlyData: generateHourlyData(city, multiplier, '惊喜', selectedDates, threshold) }
      ];
    });
  });
};

const generateMockFenceForecast = (cities: string[], selectedDates: string[]): FenceRow[] => {
  const configs = [
    { city: '保定市', name: '保定核心区域_热区1', type: '人工' as const },
    { city: '滨州市', name: '滨州老城区_围栏2', type: '人工' as const },
    { city: '大连市', name: '大连中山路_热区1', type: '人工' as const },
  ].filter(cfg => cities.includes('全部') || cities.includes(cfg.city));

  return configs.flatMap((cfg, idx) => {
    return ['泛快', '特惠'].map(cat => {
      const hourlyData: FenceHourlyPoint[] = Array.from({ length: selectedDates.length * 24 }, (_, i) => {
        const hour = i % 24;
        const dateIndex = Math.floor(i / 24);
        const dateStr = selectedDates[dateIndex];
        
        const isTargetShortage = cfg.city === '保定市' && cat === '泛快' && (
          (hour >= 7 && hour <= 10) || (hour >= 18 && hour <= 20)
        );
        
        const baseCr = isTargetShortage ? (52 + Math.random() * 6) : (88 + Math.random() * 8); 
        const baseImpact = isTargetShortage ? (0.55 + Math.random() * 0.1) : (0.15 + Math.random() * 0.1);
        const baseUnanswered = isTargetShortage ? (160 + Math.floor(Math.random() * 80)) : (30 + Math.random() * 50);
        const baseCalls = isTargetShortage ? (250 + Math.floor(Math.random() * 100)) : (80 + Math.random() * 40);

        return {
          hour,
          fullDate: dateStr,
          absoluteIndex: i,
          cr: Number(baseCr.toFixed(1)),
          crAlgo: Number(baseCr.toFixed(1)),
          crL4W: Number((baseCr - 1).toFixed(1)),
          crLastWeek: Number((baseCr + 0.5).toFixed(1)),
          crCustom: Number(baseCr.toFixed(1)),
          impact: Number(baseImpact.toFixed(2)),
          impactAlgo: Number(baseImpact.toFixed(2)), 
          impactL4W: Number((baseImpact - 0.1).toFixed(2)), 
          impactLastWeek: Number((baseImpact + 0.05).toFixed(2)), 
          impactCustom: Number(baseImpact.toFixed(2)),
          unanswered: Math.floor(baseUnanswered),
          unansweredAlgo: Math.floor(baseUnanswered), 
          unansweredL4W: Math.floor(baseUnanswered * 0.8), 
          unansweredLastWeek: Math.floor(baseUnanswered * 1.1), 
          unansweredCustom: Math.floor(baseUnanswered),
          calls: Math.floor(baseCalls),
          callsAlgo: Math.floor(baseCalls),
          callsL4W: Math.floor(baseCalls * 0.9),
          callsLastWeek: Math.floor(baseCalls * 1.05),
          callsCustom: Math.floor(baseCalls),
          status: baseCr < 70 ? ShortageLevel.SEVERE : baseCr < 80 ? ShortageLevel.MODERATE : ShortageLevel.NORMAL
        };
      });

      const fenceId = `ID${1000 + (idx * 2) + (cat === '泛快' ? 0 : 1)}`;

      return {
        id: fenceId, cityName: cfg.city, fenceName: cfg.name, fenceType: cfg.type, category: cat, date: selectedDates[0], hourlyData
      };
    });
  });
};

const App: React.FC = () => {
  const [currentMenu, setCurrentMenu] = useState<'console' | 'forms' | 'audit'>('console');
  const [forecastTab, setForecastTab] = useState<'city' | 'fence'>('city');
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [activeTab, setActiveTab] = useState<'strategy' | 'history'>('strategy');
  
  const [tableDisplayMode, setTableDisplayMode] = useState<'all-day' | 'hourly' | 'both'>('both');
  
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState(false);
  const [isStrategyConfigModalOpen, setIsStrategyConfigModalOpen] = useState(false);
  const [strategyToEdit, setStrategyToEdit] = useState<StrategyRow | null>(null);
  const [strategyConfigInitialParams, setStrategyConfigInitialParams] = useState<{city?: string, category?: string, date?: string, hour?: number, endHour?: number, fence?: string} | null>(null);
  const [isActiveRulesModalOpen, setIsActiveRulesModalOpen] = useState(false);
  const [isFenceMapDrawerOpen, setIsFenceMapDrawerOpen] = useState(false);
  const [selectedFenceForMap, setSelectedFenceForMap] = useState<{ id: string, name: string, city: string, type: string } | null>(null);
  const [isAIChatDrawerOpen, setIsAIChatDrawerOpen] = useState(false); 
  const [activeAIChatTab, setActiveAIChatTab] = useState('chat');
  const [activeSkillForAI, setActiveSkillForAI] = useState<string | undefined>(undefined);
  const [selectedEventForDrawer, setSelectedEventForDrawer] = useState<EventItem | null>(null);
  const [selectedAreaForAI, setSelectedAreaForAI] = useState<{city: string, category: string, date: string, startHour: number, endHour: number} | null>(null);
  const [hoveredStrategyForTable, setHoveredStrategyForTable] = useState<{city: string, category: string, date: string, timeSlot: string} | null>(null);

  const [cityRegionMode, setCityRegionMode] = useState<'all' | 'main' | 'district'>('all');
  const [mainCityFenceName, setMainCityFenceName] = useState<string>('');
  const [isMainCityFenceUploaded, setIsMainCityFenceUploaded] = useState(false);
  const [isMainCityUploadModalOpen, setIsMainCityUploadModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRegionModeChange = (mode: 'all' | 'main' | 'district') => {
    if (mode === 'main' && !isMainCityFenceUploaded) {
      setIsMainCityUploadModalOpen(true);
    } else {
      setCityRegionMode(mode);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 模拟上传成功，设置围栏名称
      setMainCityFenceName(file.name.replace(/\.[^/.]+$/, ""));
      setIsMainCityFenceUploaded(true);
      setCityRegionMode('main');
      setIsMainCityUploadModalOpen(false);
    }
  };

  const [metric, setMetric] = useState<MetricType>('rate');
  const [fenceMetric, setFenceMetric] = useState<FenceMetricType>('cr');
  const [comparisons, setComparisons] = useState<ComparisonType[]>(['l4w']); 
  
  const [selectedDates, setSelectedDates] = useState<string[]>([TOMORROW]);
  const [selectedCities, setSelectedCities] = useState<string[]>(['保定市', '滨州市', '常州市', '大连市', '大同市']);
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['泛快', '特惠']);
  const [selectedOtherMetrics, setSelectedOtherMetrics] = useState<string[]>([]);
  const [showMismatch, setShowMismatch] = useState(true);
  const [mismatchMode, setMismatchMode] = useState<'special-pan' | 'surprise-special'>('special-pan');
  const [drilldownDate, setDrilldownDate] = useState<string>(TOMORROW);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  useEffect(() => {
    if (selectedDates.length > 0 && !selectedDates.includes(drilldownDate)) {
      setDrilldownDate(selectedDates[0]);
    }
  }, [selectedDates, drilldownDate]);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  const toggleCity = (city: string) => {
    setSelectedCities(prev => prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setIsCityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [severeThreshold, setSevereThreshold] = useState(70); 
  const [normalThreshold, setNormalThreshold] = useState(85); 

  const [hiddenHours, setHiddenHours] = useState<number[]>([]);

  const [customDates, setCustomDates] = useState<string[]>(['2026-01-10', '2026-01-12', '2026-01-20']);
  const [calcMethod, setCalcMethod] = useState<'avg' | 'moving_avg' | 'none'>('avg');
  const [isCustomDateConfigOpen, setIsCustomDateConfigOpen] = useState(false);
  const customConfigRef = useRef<HTMLDivElement>(null);

  const [highlightedCellId, setHighlightedCellId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (customConfigRef.current && !customConfigRef.current.contains(e.target as Node)) {
        setIsCustomDateConfigOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addCustomDate = (date: string) => {
    if (date && !customDates.includes(date)) setCustomDates([...customDates, date]);
  };

  const removeCustomDate = (date: string) => {
    setCustomDates(customDates.filter(d => d !== date));
  };

  const [diagnosticScenarios, setDiagnosticScenarios] = useState<DiagnosticScenario[]>([
    {
      id: 'rule-pan-express-default',
      cities: ['大连', '保定', '滨州', '大同'],
      category: '泛快',
      conditions: [
        { id: 'cd-1', category: '泛快', metric: '客观CR', operator: '小于', threshold: '60', logic: '且' }
      ],
      fenceTypeSelection: 'manual',
      fenceList: [],
      prompt: '诊断品类：泛快\n诊断逻辑：泛快客观CR<60%'
    },
    {
      id: 'rule-fence-1',
      cities: ['保定市', '滨州市', '常州市', '大连市', '大同市'],
      category: '特惠',
      conditions: [
        { id: 'c1', category: '特惠', metric: '客观CR', operator: '小于等于', threshold: '75', logic: '且' }
      ],
      fenceList: [],
      fenceTypeSelection: 'algo',
      algoFenceRange: 'top50',
      prompt: '诊断品类：特惠\n诊断逻辑：特惠客观CR<=75%'
    },
    {
      id: 'rule-1',
      cities: ['大连', '保定', '滨州', '常州', '大同'],
      category: '泛快',
      conditions: [
        { id: 'c1-1', category: '泛快', metric: '客观CR', operator: '大于等于', threshold: '60', logic: '且' },
        { id: 'c1-2', category: '泛快', metric: '客观CR', operator: '小于', threshold: '80', logic: '且' }
      ],
      fenceList: [
        { id: 'F001', name: '核心商圈', type: 'manual' },
        { id: 'F002', name: '火车站周边', type: 'manual' },
        { id: 'ALG_H01', type: 'algo' }
      ],
      fenceTypeSelection: 'algo',
      prompt: '诊断品类：泛快\n诊断逻辑：60%<=泛快客观CR<80%'
    }
  ]);

  const [events, setEvents] = useState<EventItem[]>([...ATTENTION_EVENTS]);
  
  const [batchStrategies, setBatchStrategies] = useState<BatchStrategyItem[]>([]);

  // 初始化策略列表
  const [customStrategies, setCustomStrategies] = useState<StrategyRow[]>(() => {
    const saved = localStorage.getItem('b_subsidy_custom_strategies');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved strategies:', e);
      }
    }
    return [
      {
        id: 'st-1',
        city: '保定市',
        fence: '全城',
        category: '泛快',
        date: TOMORROW,
        timeSlot: '07:00-09:00',
        userGroup: '全量司机',
        tactic: '冲单奖',
        rule: '满5单得20元',
        acquisitionMethod: '系统直发',
        estSubsidy: '45,000',
        estSubsidyRate: '1.2%',
        source: '规则生成',
        sourceId: 'ALGO-BD-001',
        linkedEvent: '早高峰常规补'
      },
      {
        id: 'st-2',
        city: '大连市',
        fence: '中山区核心围栏',
        category: '特惠',
        date: TOMORROW,
        timeSlot: '17:00-19:00',
        userGroup: '高粘性司机',
        tactic: '加速卡',
        rule: '每单加速20%',
        acquisitionMethod: '领取',
        estSubsidy: '32,000',
        estSubsidyRate: '0.85%',
        source: '规则生成',
        sourceId: 'RULE-DL-102',
        linkedEvent: '晚高峰溢价补'
      },
      {
        id: 'st-4',
        city: '常州市',
        fence: '全城',
        category: '泛快',
        date: TOMORROW,
        timeSlot: '06:00-23:00',
        userGroup: '全量司机',
        tactic: '免佣',
        rule: '全天免佣',
        acquisitionMethod: '系统直发',
        estSubsidy: '125,000',
        estSubsidyRate: '3.5%',
        source: '人工配置',
        linkedEvent: '中雪天气应急'
      },
      {
        id: 'st-9',
        city: '常州市',
        fence: '武进区',
        category: '特惠',
        date: TOMORROW,
        timeSlot: '17:00-20:00',
        userGroup: '全量司机',
        tactic: '冲单奖',
        rule: '满3单得10元',
        acquisitionMethod: '系统直发',
        estSubsidy: '14,200',
        estSubsidyRate: '0.75%',
        source: '规则生成',
        sourceId: 'PRED-CZ-05',
        linkedEvent: '晚高峰常规补'
      },
      {
        id: 'st-12',
        city: '滨州市',
        fence: '全城',
        category: '泛快',
        date: TOMORROW,
        timeSlot: '07:00-10:00',
        userGroup: '全量司机',
        tactic: '冲单奖',
        rule: '满10单得30元',
        acquisitionMethod: '系统直发',
        estSubsidy: '52,000',
        estSubsidyRate: '1.4%',
        source: '规则生成-人工修整',
        sourceId: 'PRED-FIX-BZ-01',
        linkedEvent: '早高峰运力保障'
      },
      {
        id: 'st-13',
        city: '大连市',
        fence: '甘井子区',
        category: '特惠',
        date: DAY_AFTER_TOMORROW,
        timeSlot: '16:00-20:00',
        userGroup: '全量司机',
        tactic: '加速卡',
        rule: '每单加速15%',
        acquisitionMethod: '领取',
        estSubsidy: '24,500',
        estSubsidyRate: '0.7%',
        source: '规则生成-人工修整',
        sourceId: 'ALGO-FIX-DL-02',
        linkedEvent: '晚高峰溢价平抑'
      },
      {
        id: 'st-14',
        city: '保定市',
        fence: '保定核心区域_热区1',
        category: '泛快',
        date: TOMORROW,
        timeSlot: '07:00-10:00',
        userGroup: '全量司机',
        tactic: '冲单奖',
        rule: '满3单得15元',
        acquisitionMethod: '系统直发',
        estSubsidy: '68,000',
        estSubsidyRate: '2.1%',
        source: '规则生成-人工修整',
        sourceId: 'DIAG-BD-101',
        linkedEvent: '早高峰严重缺口'
      },
      {
        id: 'st-15',
        city: '常州市',
        fence: '全城',
        category: '泛快',
        date: TOMORROW,
        timeSlot: '08:00-12:00',
        userGroup: '全量司机',
        tactic: '免佣',
        rule: '高峰免佣',
        acquisitionMethod: '系统直发',
        estSubsidy: '95,000',
        estSubsidyRate: '4.2%',
        source: '规则生成',
        sourceId: 'LLM-CZ-SNOW',
        linkedEvent: '中雪天气应急'
      }
    ];
  });

  // 持久化保存
  useEffect(() => {
    localStorage.setItem('b_subsidy_custom_strategies', JSON.stringify(customStrategies));
  }, [customStrategies]);
  const [highlightedStrategyIds, setHighlightedStrategyIds] = useState<string[]>([]);

  const handleAddStrategies = (newStrategies: StrategyRow[]) => {
    setCustomStrategies(prev => {
      const next = [...prev];
      newStrategies.forEach(newS => {
        const index = next.findIndex(s => s.id === newS.id);
        if (index !== -1) {
          // 如果是编辑已有策略
          const oldS = next[index];
          let updatedSource = newS.source;
          
          // 如果原来源是“历史复制”，修改后变为“历史复制-人工修整”
          if (oldS.source === '历史复制') {
            updatedSource = '历史复制-人工修整' as any;
          }
          
          next[index] = { ...newS, source: updatedSource };
        } else {
          // 如果是新增策略
          next.unshift(newS);
        }
      });
      return next;
    });
    
    const ids = newStrategies.map(s => s.id);
    setHighlightedStrategyIds(ids);
    setActiveTab('strategy'); // 确保切换到工作台标签
    
    setTimeout(() => setHighlightedStrategyIds([]), 3000); // 3秒后停止高亮

    // 自动滚动到第一个添加的策略
    if (ids.length > 0) {
      setTimeout(() => {
        const element = document.getElementById(`strategy-row-${ids[0]}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      return selectedDates.some(date => event.startDate <= date && event.endDate >= date);
    });
  }, [events, selectedDates]);

  const attentionCount = useMemo(() => filteredEvents.filter(e => e.severity === '高' || e.severity === '中').length, [filteredEvents]);

  const forecastData = useMemo(() => generateMockForecast(selectedCities, cityRegionMode, selectedDates, severeThreshold), [selectedCities, cityRegionMode, selectedDates, severeThreshold]);
  const fenceForecastData = useMemo(() => generateMockFenceForecast(selectedCities, selectedDates), [selectedCities, selectedDates]);

  const filteredForecastData = useMemo(() => {
    return forecastData.filter(row => selectedCategories.includes(row.category));
  }, [forecastData, selectedCategories]);

  const allCityNames = useMemo(() => ALL_CITIES, []);
  const allCategories = useMemo(() => Array.from(new Set(forecastData.map(d => d.category))), [forecastData]);

  const openEventDrawer = (event?: EventItem) => {
    setSelectedEventForDrawer(event || null);
    setActiveAIChatTab('events');
    setIsAIChatDrawerOpen(true);
  };

  const openSpecialEventsCopilot = () => {
    setActiveSkillForAI('特殊事件监测');
    setIsAIChatDrawerOpen(true);
  };

  const handleToggleMark = (id: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, isMarked: !e.isMarked } : e));
  };

  const handlePredictionToggle = (p: ComparisonType) => {
    setComparisons(prev => {
      const next = prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p];
      if (p === 'custom' && !prev.includes('custom')) {
        setIsCustomDateConfigOpen(true);
      }
      return next;
    });
  };

  const handleCopyHistory = (historyItems: HistoryStrategyItem[]) => {
    const newStrategies: StrategyRow[] = historyItems.map(item => ({
      id: `copied-${item.activityId}-${Date.now()}`,
      city: item.city,
      fence: item.fenceId.replace('ID', '').replace('>', ''), // 清理 ID 标识
      category: item.category,
      date: '', // 粘贴的策略日期为空
      timeSlot: item.timeSlot,
      userGroup: item.userGroup,
      tactic: item.tool,
      rule: item.rewardConfig,
      acquisitionMethod: item.method,
      estSubsidy: item.writeOffAmount.toString(),
      estSubsidyRate: item.citySubsidyRate,
      source: '历史复制' as any,
      linkedEvent: '无'
    }));
    
    setCustomStrategies(prev => [...newStrategies, ...prev]);
    
    // 设置高亮并跳转到工作台
    const ids = newStrategies.map(s => s.id);
    setHighlightedStrategyIds(ids);
    setActiveTab('strategy');
    
    // 3秒后取消高亮
    setTimeout(() => setHighlightedStrategyIds([]), 3000);
    
    // 自动滚动到第一个复制的策略
    if (ids.length > 0) {
      setTimeout(() => {
        const element = document.getElementById(`strategy-row-${ids[0]}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500); // 增加延迟确保 Tab 切换和渲染完成
    }
  };

  const handleStrategyJump = (id: string) => {
    setActiveTab('strategy');
    setTimeout(() => {
      const element = document.getElementById(`strategy-row-${id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('bg-blue-100');
        setTimeout(() => element.classList.remove('bg-blue-100'), 2000);
      } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleJumpToData = (city: string, category: string, date: string, timeSlot: string) => {
    setForecastTab('city');
    setViewMode('table');
    if (tableDisplayMode === 'all-day') setTableDisplayMode('both');
    
    const startHour = parseInt(timeSlot.split(':')[0]);
    const cleanCity = city.split('(')[0]; 
    const targetCellId = `cell-${cleanCity}-${category}-${date}-${startHour}`;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setHighlightedCellId(targetCellId);
    
    setTimeout(() => {
      const targetCell = document.getElementById(targetCellId);
      if (targetCell) {
        targetCell.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    }, 200);

    setTimeout(() => setHighlightedCellId(null), 5000);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans text-gray-800 flex">
      <nav className="w-12 sm:w-16 bg-white border-r border-gray-100 flex flex-col items-center py-6 gap-6 sticky top-0 h-screen z-50 shadow-sm">
        <div className="bg-blue-600 w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl mb-4 shadow-md">B</div>
        <button onClick={() => setCurrentMenu('console')} className={`p-2 sm:p-3 rounded-xl transition-all ${currentMenu === 'console' ? 'bg-blue-50 text-blue-600 shadow-inner' : 'text-gray-400 hover:bg-gray-50'}`}><Icons.LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6" /></button>
        <button onClick={() => setCurrentMenu('forms')} className={`p-2 sm:p-3 rounded-xl transition-all ${currentMenu === 'forms' ? 'bg-blue-50 text-blue-600 shadow-inner' : 'text-gray-400 hover:bg-gray-50'}`}><Icons.Table className="w-5 h-5 sm:w-6 sm:h-6" /></button>
        <button onClick={() => setCurrentMenu('audit')} className={`p-2 sm:p-3 rounded-xl transition-all ${currentMenu === 'audit' ? 'bg-blue-50 text-blue-600 shadow-inner' : 'text-gray-400 hover:bg-gray-50'}`}><Icons.FileCheck className="w-5 h-5 sm:w-6 sm:h-6" /></button>
        <div className="flex-1"></div>
        <button className="p-2 sm:p-3 text-gray-400 hover:text-gray-600"><Icons.Settings className="w-5 h-5 sm:w-6 sm:h-6" /></button>
      </nav>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 h-12 flex items-center justify-between px-6 sticky top-0 z-[110]">
          <div className="flex items-center gap-2 shrink-0">
            <h1 className="text-base font-black text-slate-800 tracking-tight whitespace-nowrap">B补运营平台</h1>
            <span className="text-[9px] bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded font-black border border-slate-100 uppercase tracking-widest shrink-0">Enterprise v1.5</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-bold text-slate-500 shrink-0">
            <div className="flex items-center gap-1.5 hover:text-blue-600 cursor-pointer transition-colors">
              <Icons.ShieldCheck className="w-4 h-4" />
              <span>操作手册</span>
            </div>
            <div className="relative group">
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 hover:bg-slate-100 cursor-pointer transition-all">
                <Icons.Lightbulb className="w-4 h-4 text-amber-500" />
                <span>记忆</span>
              </div>
              <div className="absolute top-full right-0 mt-2 w-64 p-3 bg-slate-700 text-white text-[12px] font-medium rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[120] leading-relaxed">
                <div className="absolute -top-1 right-8 w-2 h-2 bg-slate-700 rotate-45"></div>
                点击后，筛选条件将被记忆，每次使用报表时自动生效。
              </div>
            </div>
            <div className="flex items-center gap-2">
              高级运营专家 
              <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                <Icons.User className="w-4 h-4" />
              </div>
            </div>
          </div>
        </header>

        {currentMenu === 'console' ? (
          <>
            <FilterBar 
              initialDates={selectedDates}
              initialCities={selectedCities}
              onSearch={(filters) => {
                setSelectedDates(filters.dates);
                setSelectedCities(filters.cities);
              }}
              onOpenAIChat={() => setIsAIChatDrawerOpen(true)} 
            />

            <main className="px-1 sm:px-4 md:px-6 py-2 sm:py-3 max-w-full space-y-4 w-full animate-in fade-in duration-500 pb-6">
              <section className="bg-white rounded-[20px] md:rounded-[24px] shadow-[0_8px_40px_rgba(0,0,0,0.02)] border border-gray-100 px-1 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4">
                <div className="flex justify-between items-center mb-3 flex-wrap gap-3 border-b border-gray-50 pb-3">
                  <div className="flex items-center gap-8">
                     <button onClick={() => setForecastTab('city')} className={`text-[15px] font-black pb-2 border-b-2 transition-all ${forecastTab === 'city' ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>城市宏观预测与诊断</button>
                     <button onClick={() => setForecastTab('fence')} className={`text-[15px] font-black pb-2 border-b-2 transition-all ${forecastTab === 'fence' ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>围栏预测与诊断</button>
                  </div>
                  <div className="flex items-center gap-2">
                     {forecastTab === 'city' && (
                       <button 
                         onClick={openSpecialEventsCopilot}
                         className="flex items-center gap-2 px-3 py-1.5 bg-pink-50 text-[#ed145b] rounded-xl hover:bg-pink-100 text-[11px] font-black border border-pink-100 transition-all shadow-sm active:scale-95 animate-in slide-in-from-right duration-500 shrink-0"
                       >
                         <Icons.Zap className="w-3.5 h-3.5 fill-current" />
                         AI 特殊事件监测中心 ({attentionCount > 0 ? `待关注: ${attentionCount}` : '正常运行'})
                       </button>
                     )}
                     <div className="w-px h-5 bg-gray-100 mx-1"></div>
                     
                     <div className="flex items-center gap-2">
                        <button onClick={() => setIsDiagnosticModalOpen(true)} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 text-[11px] font-bold border border-slate-200 transition-colors shadow-sm"><Icons.SlidersHorizontal className="w-3 h-3" />诊断规则</button>
                        
                        <div className="flex items-center bg-slate-100 rounded-xl p-0.5 shadow-inner border border-slate-200">
                            <button onClick={() => { setViewMode('table'); setSelectedCategories(['泛快', '特惠']); }} className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}><Icons.Table className="w-3.5 h-3.5" /></button>
                            {forecastTab === 'city' && (
                              <button onClick={() => setViewMode('chart')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'chart' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}><Icons.LineChart className="w-3.5 h-3.5" /></button>
                            )}
                        </div>
                     </div>
                  </div>
                </div>

                <div className="min-h-0">
                  {forecastTab === 'city' ? (
                      <>
                        {/* 共享筛选栏 */}
                        <div className="bg-[#f9fafc] rounded-xl p-2.5 mb-4 border border-gray-100 flex items-center justify-between shadow-sm relative z-[70] overflow-visible">
                            <div className="flex items-center gap-4 flex-wrap">
                              {/* 左侧切换 */}
                              {/* 移除了预测方式前的竖线 */}

                              {viewMode === 'table' ? (
                                <>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[11px] font-black text-slate-500 whitespace-nowrap">预测方式:</span>
                                    <div className="flex gap-1 p-0.5 bg-slate-100/60 rounded-xl border border-slate-100 shadow-inner">
                                      {[
                                        {id:'l4w', label:'4周'}, 
                                        {id:'lastWeek', label:'上周'},
                                        {id:'custom', label:'自定义'}
                                      ].map(opt => {
                                        const isActive = comparisons.includes(opt.id as ComparisonType);
                                        const isCustom = opt.id === 'custom';
                                        
                                        const buttonContent = (
                                          <button 
                                            key={opt.id}
                                            onClick={() => {
                                              handlePredictionToggle(opt.id as ComparisonType);
                                              if (isCustom) {
                                                if (!comparisons.includes('custom')) {
                                                  setIsCustomDateConfigOpen(true);
                                                } else {
                                                  setIsCustomDateConfigOpen(false);
                                                }
                                              }
                                            }}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black transition-all border ${isActive ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:border-blue-400'}`}
                                          >
                                            {isActive ? (
                                              <div className="w-3 h-3 rounded-[3px] bg-white text-blue-600 flex items-center justify-center">
                                                <svg className="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                              </div>
                                            ) : (
                                              <div className="w-3 h-3 rounded-[3px] border border-slate-300"></div>
                                            )}
                                            {opt.label}
                                            {isCustom && isActive && (
                                              <Icons.Settings 
                                                className="w-3 h-3 cursor-pointer hover:rotate-90 transition-transform ml-0.5" 
                                                onClick={(e) => { 
                                                  e.stopPropagation(); 
                                                  setIsCustomDateConfigOpen(!isCustomDateConfigOpen); 
                                                }} 
                                              />
                                            )}
                                          </button>
                                        );

                                        if (isCustom) {
                                          return (
                                            <div className="relative" ref={customConfigRef} key={opt.id}>
                                              {buttonContent}
                                              {isCustomDateConfigOpen && (
                                                <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-100 rounded-[24px] shadow-[0_15px_45px_rgba(0,0,0,0.15)] z-[100] p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
                                                  <div className="space-y-3">
                                                     <label className="text-[13px] font-bold text-gray-500 block">选择日期（多选）</label>
                                                     <div className="relative group">
                                                       <input 
                                                        type="date" 
                                                        className="w-full border border-gray-100 rounded-2xl px-4 py-2.5 text-[13px] font-bold text-slate-700 outline-none bg-slate-50/50 group-focus-within:bg-white group-focus-within:border-blue-400 transition-all" 
                                                        onChange={(e) => { addCustomDate(e.target.value); e.target.value = ''; }} 
                                                       />
                                                       <Icons.Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-blue-500 pointer-events-none transition-colors" />
                                                     </div>
                                                     <div className="flex flex-wrap gap-2 pt-1 max-h-32 overflow-y-auto custom-scrollbar">
                                                       {customDates.map(d => (
                                                         <span key={d} className="bg-blue-50 text-blue-600 text-[11px] font-black px-3 py-1.5 rounded-full border border-blue-100 flex items-center gap-2 shadow-sm hover:shadow transition-all group">
                                                           {d} <Icons.X className="w-3.5 h-3.5 cursor-pointer text-blue-300 group-hover:text-red-500 transition-colors" onClick={() => removeCustomDate(d)} />
                                                         </span>
                                                       ))}
                                                     </div>
                                                  </div>
                                                  <div className="space-y-3 border-t border-gray-50 pt-5">
                                                     <label className="text-[13px] font-bold text-gray-500 block">计算公式</label>
                                                     <div className="flex p-1 bg-slate-100/60 rounded-2xl gap-1">
                                                        <button 
                                                          onClick={() => setCalcMethod('avg')} 
                                                          className={`flex-1 py-2 rounded-xl text-[11px] font-black transition-all ${calcMethod === 'avg' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-gray-400 hover:text-gray-600'}`}
                                                        >
                                                          算数平均值
                                                        </button>
                                                        <button 
                                                          onClick={() => setCalcMethod('moving_avg')} 
                                                          className={`flex-1 py-2 rounded-xl text-[11px] font-black transition-all ${calcMethod === 'moving_avg' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-gray-400 hover:text-gray-600'}`}
                                                        >
                                                          稳健平均
                                                        </button>
                                                        <button 
                                                          onClick={() => setCalcMethod('none')} 
                                                          className={`flex-1 py-2 rounded-xl text-[11px] font-black transition-all ${calcMethod === 'none' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-gray-400 hover:text-gray-600'}`}
                                                        >
                                                          无
                                                        </button>
                                                     </div>
                                                  </div>
                                                  <button 
                                                    onClick={() => setIsCustomDateConfigOpen(false)} 
                                                    className="w-full py-3.5 bg-blue-600 text-white rounded-2xl text-[14px] font-black shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all mt-2"
                                                  >
                                                    完成设置
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        }

                                        return buttonContent;
                                      })}
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  {/* 预测方式 */}
                                  <div className="flex items-center gap-3">
                                    <span className="text-[11px] font-black text-slate-500 whitespace-nowrap">预测方式:</span>
                                    <div className="flex bg-slate-100/60 p-0.5 rounded-xl border border-slate-100 shadow-inner">
                                      {[
                                        {id:'l4w', label:'4周'}, 
                                        {id:'lastWeek', label:'上周'},
                                        {id:'custom', label:'自定义'}
                                      ].map(opt => {
                                        const isActive = comparisons.includes(opt.id as ComparisonType);
                                        const isCustom = opt.id === 'custom';

                                        const buttonContent = (
                                          <button 
                                            key={opt.id}
                                            onClick={() => handlePredictionToggle(opt.id as ComparisonType)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black transition-all border ${isActive ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:border-blue-400'}`}
                                          >
                                            <div className={`w-3 h-3 rounded-[3px] flex items-center justify-center ${isActive ? 'bg-white text-blue-600' : 'border border-slate-300'}`}>
                                              {isActive && <svg className="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                            </div>
                                            {opt.label}
                                            {isCustom && isActive && (
                                              <Icons.Settings 
                                                className="w-3 h-3 cursor-pointer hover:rotate-90 transition-transform ml-0.5" 
                                                onClick={(e) => { 
                                                  e.stopPropagation(); 
                                                  setIsCustomDateConfigOpen(!isCustomDateConfigOpen); 
                                                }} 
                                              />
                                            )}
                                          </button>
                                        );

                                        if (isCustom) {
                                          return (
                                            <div className="relative" ref={customConfigRef} key={opt.id}>
                                              {buttonContent}
                                              {isCustomDateConfigOpen && (
                                                <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-100 rounded-[24px] shadow-[0_15px_45px_rgba(0,0,0,0.15)] z-[100] p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
                                                  <div className="space-y-3">
                                                     <label className="text-[13px] font-bold text-gray-500 block">选择日期（多选）</label>
                                                     <div className="relative group">
                                                       <input 
                                                        type="date" 
                                                        className="w-full border border-gray-100 rounded-2xl px-4 py-2.5 text-[13px] font-bold text-slate-700 outline-none bg-slate-50/50 group-focus-within:bg-white group-focus-within:border-blue-400 transition-all" 
                                                        onChange={(e) => { addCustomDate(e.target.value); e.target.value = ''; }} 
                                                       />
                                                       <Icons.Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-blue-500 pointer-events-none transition-colors" />
                                                     </div>
                                                     <div className="flex flex-wrap gap-2 pt-1 max-h-32 overflow-y-auto custom-scrollbar">
                                                       {customDates.map(d => (
                                                         <span key={d} className="bg-blue-50 text-blue-600 text-[11px] font-black px-3 py-1.5 rounded-full border border-blue-100 flex items-center gap-2 shadow-sm hover:shadow transition-all group">
                                                           {d} <Icons.X className="w-3.5 h-3.5 cursor-pointer text-blue-300 group-hover:text-red-500 transition-colors" onClick={() => removeCustomDate(d)} />
                                                         </span>
                                                       ))}
                                                     </div>
                                                  </div>
                                                  <div className="space-y-3 border-t border-gray-50 pt-5">
                                                     <label className="text-[13px] font-bold text-gray-500 block">计算公式</label>
                                                     <div className="flex p-1 bg-slate-100/60 rounded-2xl gap-1">
                                                        <button 
                                                          onClick={() => setCalcMethod('avg')} 
                                                          className={`flex-1 py-2 rounded-xl text-[11px] font-black transition-all ${calcMethod === 'avg' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-gray-400 hover:text-gray-600'}`}
                                                        >
                                                          算数平均值
                                                        </button>
                                                        <button 
                                                          onClick={() => setCalcMethod('moving_avg')} 
                                                          className={`flex-1 py-2 rounded-xl text-[11px] font-black transition-all ${calcMethod === 'moving_avg' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-gray-400 hover:text-gray-600'}`}
                                                        >
                                                          稳健平均
                                                        </button>
                                                        <button 
                                                          onClick={() => setCalcMethod('none')} 
                                                          className={`flex-1 py-2 rounded-xl text-[11px] font-black transition-all ${calcMethod === 'none' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-gray-400 hover:text-gray-600'}`}
                                                        >
                                                          无
                                                        </button>
                                                     </div>
                                                  </div>
                                                  <button 
                                                    onClick={() => setIsCustomDateConfigOpen(false)} 
                                                    className="w-full py-3.5 bg-blue-600 text-white rounded-2xl text-[14px] font-black shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all mt-2"
                                                  >
                                                    完成设置
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        }

                                        return buttonContent;
                                      })}
                                    </div>
                                  </div>

                                  {/* 移除了预测方式后的竖线 */}

                                  <div className="flex items-center gap-3 shrink-0 ml-6 flex-wrap">
                                    {/* 对比城市 */}
                                    <div className="flex items-center gap-1 relative z-[80]" ref={cityDropdownRef}>
                                      <span className="text-[11px] font-black text-slate-500 whitespace-nowrap">对比城市:</span>
                                      <div className="flex items-center gap-1 bg-slate-50 p-0.5 rounded-xl border border-slate-200 min-h-[36px] relative">
                                        {selectedCities.slice(0, 2).map((city) => (
                                          <div key={city} className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-blue-600 shadow-xs">
                                            <span className="text-[11px] font-bold">{city}</span>
                                            <Icons.X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => toggleCity(city)} />
                                          </div>
                                        ))}
                                        {selectedCities.length > 2 && <span className="text-[11px] font-bold text-slate-400 px-1">...</span>}
                                        <button onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)} className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-300 hover:text-blue-600 transition-all"><Icons.Plus className="w-3 h-3" /></button>
                                        {isCityDropdownOpen && (
                                          <div className="absolute top-full mt-1 right-0 w-40 bg-white border border-slate-100 rounded-xl shadow-xl z-[100] p-1">
                                            <div className="max-h-40 overflow-y-auto">
                                              {allCityNames.filter(c => !selectedCities.includes(c)).map(c => ( 
                                                <button 
                                                  key={c} 
                                                  onClick={() => { toggleCity(c); setIsCityDropdownOpen(false); }} 
                                                  className="w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-blue-50 transition-colors"
                                                >
                                                  {c}
                                                </button> 
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* 品类选择 (单选) */}
                                    <div className="flex items-center gap-1">
                                      <span className="text-[11px] font-black text-slate-500 whitespace-nowrap">品类:</span>
                                      <div className="flex bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
                                        {['泛快', '特惠'].map(cat => (
                                          <button
                                            key={cat}
                                            onClick={() => setSelectedCategories([cat])}
                                            className={`px-3 py-1 rounded-md text-[11px] font-black transition-all ${selectedCategories.includes(cat) ? 'bg-[#C83E73] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                                          >
                                            {cat}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* 品类错配 (单选) */}
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[11px] font-black text-slate-500 whitespace-nowrap">品类错配:</span>
                                      <div className="flex bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
                                        {[
                                          {id: 'special-pan', label: '特惠-普快'},
                                          {id: 'surprise-special', label: '惊喜-特惠'}
                                        ].map(opt => (
                                          <button 
                                            key={opt.id}
                                            onClick={() => { setShowMismatch(true); setMismatchMode(opt.id as any); }}
                                            className={`px-3 py-1 rounded-md text-[11px] font-black transition-all whitespace-nowrap ${showMismatch && mismatchMode === opt.id ? 'bg-[#C83E73] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                                          >
                                            {opt.label}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* 其他指标 (多选) */}
                                    <OtherMetricsDropdown 
                                      selectedValues={selectedOtherMetrics}
                                      onChange={setSelectedOtherMetrics}
                                    />
                                  </div>
                                </>
                              )}
                            </div>

                            {viewMode === 'table' && (
                              <div className="flex items-center gap-3 shrink-0 ml-6 flex-wrap">
                                 <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-black text-slate-500 whitespace-nowrap">时段显示:</span>
                                    <div className="flex bg-white border border-gray-200 p-0.5 rounded-lg shadow-sm">
                                      <button 
                                        onClick={() => setTableDisplayMode('all-day')}
                                        className={`px-3 py-1 text-[11px] font-black rounded-md transition-all whitespace-nowrap ${tableDisplayMode === 'all-day' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                                      >
                                        全天
                                      </button>
                                      <button 
                                        onClick={() => setTableDisplayMode('hourly')}
                                        className={`px-3 py-1 text-[11px] font-black rounded-md transition-all whitespace-nowrap ${tableDisplayMode === 'hourly' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                                      >
                                        小时
                                      </button>
                                      <button 
                                        onClick={() => setTableDisplayMode('both')}
                                        className={`px-3 py-1 text-[11px] font-black rounded-md transition-all whitespace-nowrap ${tableDisplayMode === 'both' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                                      >
                                        全天+小时
                                      </button>
                                    </div>
                                 </div>
                                 
                                 <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-black text-slate-500 whitespace-nowrap">城市区域:</span>
                                    <div className="flex bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
                                      <button 
                                        onClick={() => handleRegionModeChange('all')} 
                                        className={`px-3 py-1 rounded-md text-[11px] font-black transition-all ${cityRegionMode === 'all' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                                      >
                                        全城
                                      </button>
                                      <button 
                                        onClick={() => handleRegionModeChange('main')} 
                                        className={`px-3 py-1 rounded-md text-[11px] font-black transition-all flex items-center gap-1.5 ${cityRegionMode === 'main' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                                      >
                                        <span>主城</span>
                                        {!isMainCityFenceUploaded ? (
                                          <span className="text-orange-500 text-[10px]" title="需要人工上传主城区围栏">❗️</span>
                                        ) : (
                                          <span className="text-green-500 text-[10px]">✅</span>
                                        )}
                                      </button>
                                      <button 
                                        onClick={() => handleRegionModeChange('district')} 
                                        className={`px-3 py-1 rounded-md text-[11px] font-black transition-all ${cityRegionMode === 'district' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                                      >
                                        行政区
                                      </button>
                                    </div>
                                    <input 
                                      type="file" 
                                      ref={fileInputRef} 
                                      className="hidden" 
                                      accept=".xlsx,.xls,.csv" 
                                      onChange={handleFileUpload} 
                                    />
                                 </div>

                                 {/* 其他指标 (多选) */}
                                 <OtherMetricsDropdown 
                                   selectedValues={selectedOtherMetrics}
                                   onChange={setSelectedOtherMetrics}
                                 />
                              </div>
                            )}
                          </div>

                          {viewMode === 'table' ? (
                            <ForecastTable 
                              data={filteredForecastData} 
                              metric={metric} 
                              comparisons={comparisons} 
                              cityRegionMode={cityRegionMode}
                              mainCityFenceName={mainCityFenceName}
                              displayMode={tableDisplayMode}
                              selectedOtherMetrics={selectedOtherMetrics}
                              events={filteredEvents}
                              onEventClick={openEventDrawer}
                              diagnosticScenarios={diagnosticScenarios}
                              customDates={customDates}
                              calcMethod={calcMethod}
                              strategies={customStrategies}
                              onStrategyClick={handleStrategyJump}
                              onAddStrategy={(city, category, date, hour, endHour) => {
                                setStrategyToEdit(null);
                                setStrategyConfigInitialParams({ city, category, date, hour, endHour });
                                setIsStrategyConfigModalOpen(true);
                              }}
                              highlightedCellId={highlightedCellId}
                              hiddenHours={hiddenHours}
                              setHiddenHours={setHiddenHours}
                              onAreaSelect={setSelectedAreaForAI}
                            />
                          ) : (
                            <ForecastChart 
                              data={filteredForecastData}
                              metric={metric}
                              setMetric={setMetric}
                              activePredictions={comparisons}
                              setActivePredictions={setComparisons}
                              severeThreshold={severeThreshold}
                              setSevereThreshold={setSevereThreshold}
                              normalThreshold={normalThreshold}
                              setNormalThreshold={setNormalThreshold}
                              allCityNames={allCityNames}
                              allCategories={allCategories}
                              selectedDates={selectedDates}
                              hiddenHours={hiddenHours}
                              selectedCategories={selectedCategories}
                              setSelectedCategories={setSelectedCategories}
                              showMismatch={showMismatch}
                              setShowMismatch={setShowMismatch}
                              mismatchMode={mismatchMode}
                              setMismatchMode={setMismatchMode}
                              selectedCities={selectedCities}
                              toggleCity={toggleCity}
                              customDates={customDates}
                              setCustomDates={setCustomDates}
                              calcMethod={calcMethod}
                              setCalcMethod={setCalcMethod}
                              isCustomConfigOpen={isCustomDateConfigOpen}
                              setIsCustomConfigOpen={setIsCustomDateConfigOpen}
                              drilldownDate={drilldownDate}
                              setDrilldownDate={setDrilldownDate}
                            />
                          )}

                      </>
                    ) : (
                      <FenceForecastTable 
                        data={fenceForecastData} 
                        comparisons={comparisons} 
                        setComparisons={setComparisons}
                        metric={fenceMetric}
                        setMetric={setFenceMetric}
                        selectedOtherMetrics={selectedOtherMetrics}
                        onOtherMetricsChange={setSelectedOtherMetrics}
                        diagnosticScenarios={diagnosticScenarios}
                        onFenceClick={(fence) => {
                          setSelectedFenceForMap(fence);
                          setIsFenceMapDrawerOpen(true);
                        }}
                        strategies={customStrategies}
                        onStrategyClick={handleStrategyJump}
                        onAddStrategy={(city, category, date, hour, endHour, fence) => {
                          setStrategyToEdit(null);
                          setStrategyConfigInitialParams({ city, category, date, hour, endHour, fence });
                          setIsStrategyConfigModalOpen(true);
                        }}
                        onAreaSelect={setSelectedAreaForAI}
                        highlightedCellId={highlightedCellId}
                      />
                    )}
                </div>
              </section>

              <section className="animate-in slide-in-from-bottom-6 duration-700">
                <div className="flex items-end gap-1 mb-0 border-b border-gray-100 pl-4">
                  <button onClick={() => setActiveTab('strategy')} className={`px-6 py-2.5 rounded-t-2xl font-black text-[13px] transition-all relative top-[1px] border-t border-r border-l ${activeTab === 'strategy' ? 'bg-white border-gray-100 text-blue-600 border-b-transparent z-10 shadow-[-5px_-5px_15px_rgba(0,0,0,0.01)]' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>策略配置工作台</button>
                  <button onClick={() => setActiveTab('history')} className={`px-6 py-2.5 rounded-t-2xl font-black text-[13px] transition-all relative top-[1px] border-t border-r border-l ${activeTab === 'history' ? 'bg-white border-gray-100 text-blue-600 border-b-transparent z-10 shadow-[5px_-5px_15px_rgba(0,0,0,0.01)]' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>历史策略复盘</button>
                </div>
                <div className="bg-white px-1 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 rounded-b-[20px] md:rounded-b-[24px] border border-gray-100 border-t-0 shadow-[0_20px_60px_rgba(0,0,0,0.02)] min-h-0">
                   {activeTab === 'strategy' ? (
                     <StrategyTable 
                       items={customStrategies} 
                       highlightedIds={highlightedStrategyIds}
                       onAdd={() => {
                         setStrategyToEdit(null);
                         setStrategyConfigInitialParams(null);
                         setIsStrategyConfigModalOpen(true);
                       }} 
                       onEdit={(strategy) => {
                         setStrategyToEdit(strategy);
                         setIsStrategyConfigModalOpen(true);
                       }}
                       onSubmit={(strategies) => {
                         const now = new Date();
                         const submitTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                         const submittedIds = new Set(strategies.map(s => s.id));
                         
                         const newBatchItems: BatchStrategyItem[] = strategies.map(s => ({
                           id: `batch-${Date.now()}-${s.id}`,
                           date: s.date,
                           timeSlot: s.timeSlot,
                           city: s.city,
                           fence: s.fence,
                           category: s.category,
                           userGroup: s.userGroup,
                           tactic: s.tactic as any,
                           rule: s.rule,
                           acquisitionMethod: s.acquisitionMethod,
                           source: s.source,
                           submitter: '当前用户',
                           submitTime: submitTime,
                           status: '初始化'
                         }));
                         
                         setBatchStrategies(prev => [...newBatchItems, ...prev]);
                         setCustomStrategies(prev => prev.filter(item => !submittedIds.has(item.id)));
                       }}
                       onOpenActiveRules={() => setIsActiveRulesModalOpen(true)} 
                       onJumpToData={handleJumpToData}
                       onFenceClick={(fence) => {
                         setSelectedFenceForMap(fence);
                         setIsFenceMapDrawerOpen(true);
                       }}
                       onDelete={(id) => {
                         setCustomStrategies(prev => prev.filter(s => s.id !== id));
                       }}
                       highlightedStrategy={hoveredStrategyForTable}
                       setActiveSkillForAI={setActiveSkillForAI}
                       setIsAIChatDrawerOpen={setIsAIChatDrawerOpen}
                     />
                   ) : (
                     <HistoryStrategyTable 
                       items={[]} 
                       onCopy={handleCopyHistory} 
                       onFenceClick={(fence) => {
                         setSelectedFenceForMap(fence);
                         setIsFenceMapDrawerOpen(true);
                       }}
                     />
                   )}
                </div>
              </section>
            </main>
          </>
        ) : currentMenu === 'forms' ? (
          <BatchStrategyPage items={batchStrategies} />
        ) : (
          <BatchAuditPage />
        )}
      </div>

      <AIChatDrawer 
        isOpen={isAIChatDrawerOpen} 
        onClose={() => setIsAIChatDrawerOpen(false)} 
        activeSkill={activeSkillForAI}
        onAddStrategies={handleAddStrategies}
        specialEvents={events}
        onToggleMark={handleToggleMark}
        defaultTab={activeAIChatTab}
        selectedAreaForAI={selectedAreaForAI}
        onStrategyHover={setHoveredStrategyForTable}
        onStrategyClick={(strategy) => {
          const matchedStrategy = customStrategies.find(s => 
            s.city === strategy.city && 
            s.date === strategy.date && 
            s.timeSlot === strategy.timeSlot && 
            s.category === strategy.category
          );
          if (matchedStrategy) {
            handleStrategyJump(matchedStrategy.id);
            setIsAIChatDrawerOpen(false);
          }
        }}
      />

      <DiagnosticRulesModal 
        isOpen={isDiagnosticModalOpen} 
        onClose={() => setIsDiagnosticModalOpen(false)} 
        mode={forecastTab} 
        scenarios={diagnosticScenarios}
        setScenarios={setDiagnosticScenarios}
      />
      <MainCityUploadModal 
        isOpen={isMainCityUploadModalOpen} 
        onClose={() => setIsMainCityUploadModalOpen(false)} 
        onUpload={() => fileInputRef.current?.click()} 
      />
      <StrategyConfigModal 
        isOpen={isStrategyConfigModalOpen} 
        onClose={() => setIsStrategyConfigModalOpen(false)} 
        onSubmit={(strategy) => handleAddStrategies([strategy])}
        initialStrategy={strategyToEdit}
        initialCity={strategyConfigInitialParams?.city}
        initialCategory={strategyConfigInitialParams?.category}
        initialDate={strategyConfigInitialParams?.date}
        initialHour={strategyConfigInitialParams?.hour}
        initialEndHour={strategyConfigInitialParams?.endHour}
        initialFence={strategyConfigInitialParams?.fence}
      />
      <ActiveRulesModal 
        isOpen={isActiveRulesModalOpen} 
        onClose={() => setIsActiveRulesModalOpen(false)} 
      />
      <FenceMapDrawer
        isOpen={isFenceMapDrawerOpen}
        onClose={() => setIsFenceMapDrawerOpen(false)}
        fence={selectedFenceForMap}
      />
    </div>
  );
};

export default App;