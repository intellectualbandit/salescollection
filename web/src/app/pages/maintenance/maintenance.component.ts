import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TrackerApiService } from '../../core/services/tracker-api.service';
import { AuthService } from '../../core/services/auth.service';
import {
  ProjectItem, ProjectUnitItem, StageItem, DelayReasonItem,
  FinancingTypeItem, ActivityTypeItem
} from '../../core/models/tracker.model';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatExpansionModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule, MatListModule,
    MatDividerModule, MatSnackBarModule, MatProgressSpinnerModule,
  ],
  templateUrl: './maintenance.component.html',
  styleUrl: './maintenance.component.scss',
})
export class MaintenanceComponent implements OnInit {
  loading = signal(true);

  projects = signal<ProjectItem[]>([]);
  stages = signal<StageItem[]>([]);
  delayReasons = signal<DelayReasonItem[]>([]);
  financingTypes = signal<FinancingTypeItem[]>([]);
  activityTypes = signal<ActivityTypeItem[]>([]);

  // Project form
  projectName = '';
  projectDesc = '';
  editingProjectId: number | null = null;

  // Unit form
  unitLabel = '';
  unitType = '';
  unitTcp = 0;
  expandedProjectId: number | null = null;
  projectUnits = signal<ProjectUnitItem[]>([]);

  // Stage form
  stageName = '';
  stageSortOrder = 0;
  editingStageId: number | null = null;

  // Delay Reason form
  reasonName = '';
  editingReasonId: number | null = null;

  // Financing Type form
  ftName = '';
  editingFtId: number | null = null;

  // Activity Type form
  atCode = '';
  atName = '';
  editingAtId: number | null = null;

  constructor(
    private api: TrackerApiService,
    public auth: AuthService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  async loadAll(): Promise<void> {
    this.loading.set(true);
    try {
      const [projects, stages, delays, financing, activities] = await Promise.all([
        this.api.getProjects(),
        this.api.getStages(),
        this.api.getDelayReasons(),
        this.api.getFinancingTypes(),
        this.api.getActivityTypes(),
      ]);
      this.projects.set(projects);
      this.stages.set(stages);
      this.delayReasons.set(delays);
      this.financingTypes.set(financing);
      this.activityTypes.set(activities);
    } catch {} finally {
      this.loading.set(false);
    }
  }

  // ── Projects ──
  async saveProject(): Promise<void> {
    if (!this.projectName) return;
    try {
      if (this.editingProjectId) {
        await this.api.updateProject(this.editingProjectId, { projectName: this.projectName, description: this.projectDesc });
      } else {
        await this.api.createProject({ projectName: this.projectName, description: this.projectDesc });
      }
      this.projectName = ''; this.projectDesc = ''; this.editingProjectId = null;
      this.projects.set(await this.api.getProjects());
      this.snackBar.open('Project saved', 'OK', { duration: 2000 });
    } catch { this.snackBar.open('Failed to save project', 'OK', { duration: 3000 }); }
  }

  editProject(p: ProjectItem): void {
    this.editingProjectId = p.projectId;
    this.projectName = p.projectName;
    this.projectDesc = p.description;
  }

  async deleteProject(p: ProjectItem): Promise<void> {
    if (!confirm(`Delete project "${p.projectName}"?`)) return;
    try {
      await this.api.deleteProject(p.projectId);
      this.projects.set(await this.api.getProjects());
      this.snackBar.open('Project deleted', 'OK', { duration: 2000 });
    } catch { this.snackBar.open('Failed to delete', 'OK', { duration: 3000 }); }
  }

  async expandProject(projectId: number): Promise<void> {
    this.expandedProjectId = projectId;
    try {
      this.projectUnits.set(await this.api.getProjectUnits(projectId));
    } catch { this.projectUnits.set([]); }
  }

  async saveUnit(): Promise<void> {
    if (!this.unitLabel || !this.expandedProjectId) return;
    try {
      await this.api.createProjectUnit(this.expandedProjectId, {
        unitLabel: this.unitLabel, unitType: this.unitType, totalContractPrice: this.unitTcp
      });
      this.unitLabel = ''; this.unitType = ''; this.unitTcp = 0;
      this.projectUnits.set(await this.api.getProjectUnits(this.expandedProjectId));
      this.snackBar.open('Unit added', 'OK', { duration: 2000 });
    } catch { this.snackBar.open('Failed to add unit', 'OK', { duration: 3000 }); }
  }

  async deleteUnit(unitId: number): Promise<void> {
    if (!this.expandedProjectId || !confirm('Delete this unit?')) return;
    try {
      await this.api.deleteProjectUnit(this.expandedProjectId, unitId);
      this.projectUnits.set(await this.api.getProjectUnits(this.expandedProjectId));
      this.snackBar.open('Unit deleted', 'OK', { duration: 2000 });
    } catch { this.snackBar.open('Failed to delete', 'OK', { duration: 3000 }); }
  }

  // ── Stages ──
  async saveStage(): Promise<void> {
    if (!this.stageName) return;
    try {
      if (this.editingStageId) {
        await this.api.updateStage(this.editingStageId, { stageName: this.stageName, sortOrder: this.stageSortOrder });
      } else {
        await this.api.createStage({ stageName: this.stageName, sortOrder: this.stageSortOrder });
      }
      this.stageName = ''; this.stageSortOrder = 0; this.editingStageId = null;
      this.stages.set(await this.api.getStages());
      this.snackBar.open('Stage saved', 'OK', { duration: 2000 });
    } catch { this.snackBar.open('Failed to save', 'OK', { duration: 3000 }); }
  }

  editStage(s: StageItem): void {
    this.editingStageId = s.stageId;
    this.stageName = s.stageName;
    this.stageSortOrder = s.sortOrder;
  }

  async deleteStage(id: number): Promise<void> {
    if (!confirm('Delete this stage?')) return;
    try {
      await this.api.deleteStage(id);
      this.stages.set(await this.api.getStages());
      this.snackBar.open('Stage deleted', 'OK', { duration: 2000 });
    } catch { this.snackBar.open('Failed to delete', 'OK', { duration: 3000 }); }
  }

  // ── Delay Reasons ──
  async saveReason(): Promise<void> {
    if (!this.reasonName) return;
    try {
      if (this.editingReasonId) {
        await this.api.updateDelayReason(this.editingReasonId, { reasonName: this.reasonName });
      } else {
        await this.api.createDelayReason({ reasonName: this.reasonName });
      }
      this.reasonName = ''; this.editingReasonId = null;
      this.delayReasons.set(await this.api.getDelayReasons());
      this.snackBar.open('Saved', 'OK', { duration: 2000 });
    } catch { this.snackBar.open('Failed to save', 'OK', { duration: 3000 }); }
  }

  editReason(r: DelayReasonItem): void {
    this.editingReasonId = r.delayReasonId;
    this.reasonName = r.reasonName;
  }

  async deleteReason(id: number): Promise<void> {
    if (!confirm('Delete this delay reason?')) return;
    try {
      await this.api.deleteDelayReason(id);
      this.delayReasons.set(await this.api.getDelayReasons());
      this.snackBar.open('Deleted', 'OK', { duration: 2000 });
    } catch { this.snackBar.open('Failed to delete', 'OK', { duration: 3000 }); }
  }

  // ── Financing Types ──
  async saveFt(): Promise<void> {
    if (!this.ftName) return;
    try {
      if (this.editingFtId) {
        await this.api.updateFinancingType(this.editingFtId, { typeName: this.ftName });
      } else {
        await this.api.createFinancingType({ typeName: this.ftName });
      }
      this.ftName = ''; this.editingFtId = null;
      this.financingTypes.set(await this.api.getFinancingTypes());
      this.snackBar.open('Saved', 'OK', { duration: 2000 });
    } catch { this.snackBar.open('Failed to save', 'OK', { duration: 3000 }); }
  }

  editFt(ft: FinancingTypeItem): void {
    this.editingFtId = ft.financingTypeId;
    this.ftName = ft.typeName;
  }

  async deleteFt(id: number): Promise<void> {
    if (!confirm('Delete this financing type?')) return;
    try {
      await this.api.deleteFinancingType(id);
      this.financingTypes.set(await this.api.getFinancingTypes());
      this.snackBar.open('Deleted', 'OK', { duration: 2000 });
    } catch { this.snackBar.open('Failed to delete', 'OK', { duration: 3000 }); }
  }

  // ── Activity Types ──
  async saveAt(): Promise<void> {
    if (!this.atCode || !this.atName) return;
    try {
      if (this.editingAtId) {
        await this.api.updateActivityType(this.editingAtId, { code: this.atCode, typeName: this.atName });
      } else {
        await this.api.createActivityType({ code: this.atCode, typeName: this.atName });
      }
      this.atCode = ''; this.atName = ''; this.editingAtId = null;
      this.activityTypes.set(await this.api.getActivityTypes());
      this.snackBar.open('Saved', 'OK', { duration: 2000 });
    } catch { this.snackBar.open('Failed to save', 'OK', { duration: 3000 }); }
  }

  editAt(at: ActivityTypeItem): void {
    this.editingAtId = at.activityTypeId;
    this.atCode = at.code;
    this.atName = at.typeName;
  }

  async deleteAt(id: number): Promise<void> {
    if (!confirm('Delete this activity type?')) return;
    try {
      await this.api.deleteActivityType(id);
      this.activityTypes.set(await this.api.getActivityTypes());
      this.snackBar.open('Deleted', 'OK', { duration: 2000 });
    } catch { this.snackBar.open('Failed to delete', 'OK', { duration: 3000 }); }
  }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val);
  }
}
