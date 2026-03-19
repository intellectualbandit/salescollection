import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ClientListItem, ClientDetail, UpsertClientRequest, ResolveClientRequest,
  DashboardSummary, DashboardBreakdown, GlobalActivityItem,
  ProjectItem, ProjectUnitItem, UnitWithStatus, UnitTimelineEvent,
  StageItem, DelayReasonItem, FinancingTypeItem, ActivityTypeItem,
} from '../models/tracker.model';

@Injectable({ providedIn: 'root' })
export class TrackerApiService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // ── Dashboard ──
  getSummary(projectId?: number): Promise<DashboardSummary> {
    let params = new HttpParams();
    if (projectId) params = params.set('projectId', projectId);
    return firstValueFrom(this.http.get<DashboardSummary>(`${this.base}/dashboard/summary`, { params }));
  }

  getBreakdown(top = 6, projectId?: number): Promise<DashboardBreakdown> {
    let params = new HttpParams().set('top', top);
    if (projectId) params = params.set('projectId', projectId);
    return firstValueFrom(this.http.get<DashboardBreakdown>(`${this.base}/dashboard/breakdown`, { params }));
  }

  // ── Clients ──
  getClients(filter = 'all', search = '', sortField = 'name', sortDir = 'asc', projectId?: number): Promise<ClientListItem[]> {
    let params = new HttpParams()
      .set('filter', filter).set('search', search)
      .set('sortField', sortField).set('sortDir', sortDir);
    if (projectId) params = params.set('projectId', projectId);
    return firstValueFrom(this.http.get<ClientListItem[]>(`${this.base}/clients`, { params }));
  }

  getClient(clientId: number): Promise<ClientDetail> {
    return firstValueFrom(this.http.get<ClientDetail>(`${this.base}/clients/${clientId}`));
  }

  createClient(payload: UpsertClientRequest): Promise<ClientDetail> {
    return firstValueFrom(this.http.post<ClientDetail>(`${this.base}/clients`, payload));
  }

  updateClient(clientId: number, payload: UpsertClientRequest): Promise<ClientDetail> {
    return firstValueFrom(this.http.put<ClientDetail>(`${this.base}/clients/${clientId}`, payload));
  }

  deleteClient(clientId: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.base}/clients/${clientId}`));
  }

  resolveClient(clientId: number, payload: ResolveClientRequest): Promise<ClientDetail> {
    return firstValueFrom(this.http.post<ClientDetail>(`${this.base}/clients/${clientId}/resolve`, payload));
  }

  // ── Activities ──
  addActivity(clientId: number, payload: { activityTypeId: number; description: string; activityDate: string }): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${this.base}/clients/${clientId}/activities`, payload));
  }

  getRecentActivities(limit = 20, offset = 0): Promise<GlobalActivityItem[]> {
    const params = new HttpParams().set('limit', limit).set('offset', offset);
    return firstValueFrom(this.http.get<GlobalActivityItem[]>(`${this.base}/activities`, { params }));
  }

  // ── Tasks ──
  addTask(clientId: number, payload: { title: string; dueDate: string; priority: string }): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${this.base}/clients/${clientId}/tasks`, payload));
  }

  updateTaskStatus(clientId: number, taskId: number, isDone: boolean): Promise<void> {
    return firstValueFrom(this.http.patch<void>(`${this.base}/clients/${clientId}/tasks/${taskId}`, { isDone }));
  }

  deleteTask(clientId: number, taskId: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.base}/clients/${clientId}/tasks/${taskId}`));
  }

  // ── Projects ──
  getProjects(): Promise<ProjectItem[]> {
    return firstValueFrom(this.http.get<ProjectItem[]>(`${this.base}/projects`));
  }

  createProject(payload: { projectName: string; description: string }): Promise<ProjectItem> {
    return firstValueFrom(this.http.post<ProjectItem>(`${this.base}/projects`, payload));
  }

  updateProject(projectId: number, payload: { projectName: string; description: string }): Promise<ProjectItem> {
    return firstValueFrom(this.http.put<ProjectItem>(`${this.base}/projects/${projectId}`, payload));
  }

  deleteProject(projectId: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.base}/projects/${projectId}`));
  }

  // ── Units ──
  getProjectUnits(projectId: number): Promise<UnitWithStatus[]> {
    return firstValueFrom(this.http.get<UnitWithStatus[]>(`${this.base}/projects/${projectId}/units`));
  }

  createProjectUnit(projectId: number, payload: { unitLabel: string; unitType: string; totalContractPrice: number }): Promise<ProjectUnitItem> {
    return firstValueFrom(this.http.post<ProjectUnitItem>(`${this.base}/projects/${projectId}/units`, payload));
  }

  updateProjectUnit(projectId: number, unitId: number, payload: { unitLabel: string; unitType: string; totalContractPrice: number }): Promise<ProjectUnitItem> {
    return firstValueFrom(this.http.put<ProjectUnitItem>(`${this.base}/projects/${projectId}/units/${unitId}`, payload));
  }

  deleteProjectUnit(projectId: number, unitId: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.base}/projects/${projectId}/units/${unitId}`));
  }

  getUnitTimeline(projectId: number, unitId: number): Promise<UnitTimelineEvent[]> {
    return firstValueFrom(this.http.get<UnitTimelineEvent[]>(`${this.base}/projects/${projectId}/units/${unitId}/timeline`));
  }

  // ── Stages ──
  getStages(): Promise<StageItem[]> {
    return firstValueFrom(this.http.get<StageItem[]>(`${this.base}/stages`));
  }

  createStage(payload: { stageName: string; sortOrder: number }): Promise<StageItem> {
    return firstValueFrom(this.http.post<StageItem>(`${this.base}/stages`, payload));
  }

  updateStage(stageId: number, payload: { stageName: string; sortOrder: number }): Promise<StageItem> {
    return firstValueFrom(this.http.put<StageItem>(`${this.base}/stages/${stageId}`, payload));
  }

  deleteStage(stageId: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.base}/stages/${stageId}`));
  }

  // ── Delay Reasons ──
  getDelayReasons(): Promise<DelayReasonItem[]> {
    return firstValueFrom(this.http.get<DelayReasonItem[]>(`${this.base}/delay-reasons`));
  }

  createDelayReason(payload: { reasonName: string }): Promise<DelayReasonItem> {
    return firstValueFrom(this.http.post<DelayReasonItem>(`${this.base}/delay-reasons`, payload));
  }

  updateDelayReason(id: number, payload: { reasonName: string }): Promise<DelayReasonItem> {
    return firstValueFrom(this.http.put<DelayReasonItem>(`${this.base}/delay-reasons/${id}`, payload));
  }

  deleteDelayReason(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.base}/delay-reasons/${id}`));
  }

  // ── Financing Types ──
  getFinancingTypes(): Promise<FinancingTypeItem[]> {
    return firstValueFrom(this.http.get<FinancingTypeItem[]>(`${this.base}/financing-types`));
  }

  createFinancingType(payload: { typeName: string }): Promise<FinancingTypeItem> {
    return firstValueFrom(this.http.post<FinancingTypeItem>(`${this.base}/financing-types`, payload));
  }

  updateFinancingType(id: number, payload: { typeName: string }): Promise<FinancingTypeItem> {
    return firstValueFrom(this.http.put<FinancingTypeItem>(`${this.base}/financing-types/${id}`, payload));
  }

  deleteFinancingType(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.base}/financing-types/${id}`));
  }

  // ── Activity Types ──
  getActivityTypes(): Promise<ActivityTypeItem[]> {
    return firstValueFrom(this.http.get<ActivityTypeItem[]>(`${this.base}/activity-types`));
  }

  createActivityType(payload: { code: string; typeName: string }): Promise<ActivityTypeItem> {
    return firstValueFrom(this.http.post<ActivityTypeItem>(`${this.base}/activity-types`, payload));
  }

  updateActivityType(id: number, payload: { code: string; typeName: string }): Promise<ActivityTypeItem> {
    return firstValueFrom(this.http.put<ActivityTypeItem>(`${this.base}/activity-types/${id}`, payload));
  }

  deleteActivityType(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.base}/activity-types/${id}`));
  }
}
