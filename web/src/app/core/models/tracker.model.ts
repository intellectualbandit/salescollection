// ── Aging & Status ──
export type AgingStatus = 'critical' | 'warning' | 'watch' | 'ok';
export type ClientFilter = 'all' | 'critical' | 'warning' | 'watch' | 'ok' | 'resolved' | 'cancellation';
export type UnitStatus = 'available' | 'reserved' | 'sold' | 'cancelled';

// ── Client ──
export interface ClientListItem {
  clientId: number;
  clientName: string;
  unit: string;
  projectName: string;
  projectId: number;
  contactNumber: string;
  brokerName: string;
  totalContractPrice: number;
  financingType: string;
  stage: string;
  stageId: number;
  stageDate: string;
  targetDate: string;
  resolvedDate: string | null;
  daysInStage: number;
  delayReasons: string;
  primaryDelayReason: string;
  secondaryDelayReason: string;
  nextAction: string;
  followUpDate: string | null;
  notes: string;
  isCancellation: boolean;
  isResolved: boolean;
  overdueTasks: number;
  totalTasks: number;
  completedTasks: number;
  resolvedBy: string | null;
  resolutionNotes: string | null;
}

export interface ClientDetail extends ClientListItem {
  activities: ActivityItem[];
  tasks: TaskItem[];
}

export interface UpsertClientRequest {
  clientName: string;
  unitId: number | null;
  contactNumber: string;
  brokerName: string;
  totalContractPrice: number;
  financingTypeId: number | null;
  stageId: number;
  stageDate: string;
  targetDate: string;
  resolvedDate: string | null;
  primaryDelayReasonId: number | null;
  secondaryDelayReasonId: number | null;
  nextAction: string;
  followUpDate: string | null;
  notes: string;
  isCancellation: boolean;
}

export interface ResolveClientRequest {
  resolvedBy: string;
  resolutionNotes: string;
  resolvedDate: string;
}

// ── Activity ──
export interface ActivityItem {
  activityId: number;
  activityTypeId: number;
  activityTypeCode: string;
  activityTypeName: string;
  description: string;
  activityDate: string;
  createdAt: string;
}

export interface GlobalActivityItem extends ActivityItem {
  clientId: number;
  clientName: string;
  projectName: string;
}

// ── Task ──
export interface TaskItem {
  taskId: number;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  isDone: boolean;
  createdAt: string;
}

// ── Project & Unit ──
export interface ProjectItem {
  projectId: number;
  projectName: string;
  description: string;
}

export interface ProjectUnitItem {
  unitId: number;
  unitLabel: string;
  unitType: string;
  totalContractPrice: number;
}

export interface UnitWithStatus extends ProjectUnitItem {
  clientId: number | null;
  clientName: string | null;
  stage: string | null;
  status: UnitStatus;
}

export interface UnitTimelineEvent {
  eventId: number;
  eventType: string;
  description: string;
  performedBy: string;
  eventDate: string;
  oldValue: string | null;
  newValue: string | null;
}

// ── Pipeline Config ──
export interface StageItem {
  stageId: number;
  stageName: string;
  sortOrder: number;
}

export interface DelayReasonItem {
  delayReasonId: number;
  reasonName: string;
}

export interface FinancingTypeItem {
  financingTypeId: number;
  typeName: string;
}

export interface ActivityTypeItem {
  activityTypeId: number;
  code: string;
  typeName: string;
}

// ── Dashboard ──
export interface DashboardSummary {
  totalClients: number;
  resolvedClients: number;
  activeClients: number;
  criticalClients: number;
  warningClients: number;
  watchClients: number;
  okClients: number;
  cancellationClients: number;
  completionRatePercent: number;
  averageDelayedDays: number;
}

export interface BreakdownItem {
  label: string;
  count: number;
}

export interface ResolutionBreakdownItem {
  financingType: string;
  averageDays: number;
}

export interface DashboardBreakdown {
  byDelayReason: BreakdownItem[];
  byStage: BreakdownItem[];
  byFinancingMix: BreakdownItem[];
  byResolution: ResolutionBreakdownItem[];
}

// ── Auth ──
export interface AuthUser {
  firstName: string;
  lastName: string;
  employeeId: string;
}

export interface LoginResponse {
  token: string;
}
