import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TrackerApiService } from '../../../core/services/tracker-api.service';
import { ClientListItem, ClientDetail, ActivityItem, TaskItem } from '../../../core/models/tracker.model';

@Component({
  selector: 'app-client-detail-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatTabsModule,
    MatIconModule, MatButtonModule, MatCheckboxModule, MatChipsModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title class="detail-title">
      <span class="avatar" [style.background]="getAgingColor()">{{ data.client.clientName.charAt(0) }}</span>
      {{ data.client.clientName }}
    </h2>
    <mat-dialog-content>
      @if (loading()) {
        <div class="loading"><mat-spinner diameter="32"></mat-spinner></div>
      } @else if (detail()) {
        <mat-tab-group>
          <!-- Overview Tab -->
          <mat-tab label="Overview">
            <div class="detail-grid">
              <div class="detail-row"><span class="label">Project</span><span>{{ detail()!.projectName }}</span></div>
              <div class="detail-row"><span class="label">Unit</span><span>{{ detail()!.unit }}</span></div>
              <div class="detail-row"><span class="label">Contact</span><span>{{ detail()!.contactNumber }}</span></div>
              <div class="detail-row"><span class="label">Broker</span><span>{{ detail()!.brokerName }}</span></div>
              <div class="detail-row"><span class="label">TCP</span><span>{{ formatCurrency(detail()!.totalContractPrice) }}</span></div>
              <div class="detail-row"><span class="label">Financing</span><span>{{ detail()!.financingType }}</span></div>
              <div class="detail-row"><span class="label">Stage</span><span class="stage-badge">{{ detail()!.stage }}</span></div>
              <div class="detail-row"><span class="label">Days in Stage</span><span class="aging" [style.color]="getAgingColor()">{{ detail()!.daysInStage }} days</span></div>
              <div class="detail-row"><span class="label">Stage Date</span><span>{{ detail()!.stageDate }}</span></div>
              <div class="detail-row"><span class="label">Target Date</span><span>{{ detail()!.targetDate }}</span></div>
              @if (detail()!.resolvedDate) {
                <div class="detail-row"><span class="label">Resolved Date</span><span>{{ detail()!.resolvedDate }}</span></div>
                <div class="detail-row"><span class="label">Resolved By</span><span>{{ detail()!.resolvedBy }}</span></div>
              }
              @if (detail()!.delayReasons) {
                <div class="detail-row"><span class="label">Delay Reasons</span><span>{{ detail()!.delayReasons }}</span></div>
              }
              @if (detail()!.nextAction) {
                <div class="detail-row"><span class="label">Next Action</span><span>{{ detail()!.nextAction }}</span></div>
              }
              @if (detail()!.notes) {
                <div class="detail-row full"><span class="label">Notes</span><span>{{ detail()!.notes }}</span></div>
              }
            </div>
          </mat-tab>

          <!-- Activities Tab -->
          <mat-tab label="Activities ({{ detail()!.activities.length }})">
            <div class="tab-content">
              @if (detail()!.activities.length === 0) {
                <p class="empty">No activities recorded.</p>
              }
              @for (a of detail()!.activities; track a.activityId) {
                <div class="activity-item">
                  <mat-icon class="activity-icon">{{ getActivityIcon(a.activityTypeCode) }}</mat-icon>
                  <div class="activity-body">
                    <div class="activity-type">{{ a.activityTypeName }}</div>
                    <div class="activity-desc">{{ a.description }}</div>
                    <div class="activity-date">{{ a.activityDate | date:'medium' }}</div>
                  </div>
                </div>
              }
            </div>
          </mat-tab>

          <!-- Tasks Tab -->
          <mat-tab label="Tasks ({{ detail()!.tasks.length }})">
            <div class="tab-content">
              @if (detail()!.tasks.length === 0) {
                <p class="empty">No tasks assigned.</p>
              }
              @for (t of detail()!.tasks; track t.taskId) {
                <div class="task-item" [class.done]="t.isDone">
                  <mat-checkbox [checked]="t.isDone"
                    (change)="toggleTask(t)">
                  </mat-checkbox>
                  <div class="task-body">
                    <div class="task-title">{{ t.title }}</div>
                    <div class="task-meta">
                      <span class="priority" [class]="t.priority">{{ t.priority }}</span>
                      Due: {{ t.dueDate | date:'mediumDate' }}
                    </div>
                  </div>
                </div>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .detail-title { display: flex; align-items: center; gap: 12px; }
    .avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center;
              justify-content: center; color: #FFF; font-weight: 700; font-size: 1rem; flex-shrink: 0; }
    .loading { display: flex; justify-content: center; padding: 40px; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 16px 0; }
    .detail-row { display: flex; flex-direction: column; gap: 2px; }
    .detail-row.full { grid-column: 1 / -1; }
    .label { font-size: 0.8rem; color: #999; text-transform: uppercase; font-weight: 500; }
    .stage-badge { display: inline-block; padding: 2px 10px; border-radius: 10px; background: #FDE8E8;
                   color: #8B0000; font-size: 0.85rem; width: fit-content; }
    .aging { font-weight: 600; }
    .tab-content { padding: 16px 0; }
    .empty { text-align: center; color: #999; padding: 24px; }
    .activity-item { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid #F0F0F0; }
    .activity-icon { color: #8B0000; margin-top: 2px; }
    .activity-body { flex: 1; }
    .activity-type { font-weight: 500; font-size: 0.9rem; }
    .activity-desc { font-size: 0.85rem; color: #666; margin-top: 2px; }
    .activity-date { font-size: 0.75rem; color: #999; margin-top: 4px; }
    .task-item { display: flex; align-items: flex-start; gap: 8px; padding: 8px 0; border-bottom: 1px solid #F0F0F0; }
    .task-item.done .task-title { text-decoration: line-through; color: #999; }
    .task-body { flex: 1; }
    .task-title { font-size: 0.9rem; }
    .task-meta { font-size: 0.8rem; color: #999; margin-top: 2px; display: flex; gap: 8px; }
    .priority { padding: 1px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; }
    .priority.high { background: #FFEBEE; color: #D32F2F; }
    .priority.medium { background: #FFF3E0; color: #ED6C02; }
    .priority.low { background: #E8F5E9; color: #2E7D32; }
    mat-dialog-content { max-height: 65vh; }
    @media (max-width: 600px) { .detail-grid { grid-template-columns: 1fr; } }
  `],
})
export class ClientDetailDialogComponent implements OnInit {
  loading = signal(true);
  detail = signal<ClientDetail | null>(null);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { client: ClientListItem },
    private api: TrackerApiService,
  ) {}

  ngOnInit(): void {
    this.loadDetail();
  }

  async loadDetail(): Promise<void> {
    try {
      const d = await this.api.getClient(this.data.client.clientId);
      this.detail.set(d);
    } catch {} finally {
      this.loading.set(false);
    }
  }

  getAgingColor(): string {
    const d = this.data.client.daysInStage;
    if (d >= 30) return '#D32F2F';
    if (d >= 14) return '#ED6C02';
    if (d >= 7) return '#F9A825';
    return '#2E7D32';
  }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val);
  }

  getActivityIcon(code: string): string {
    switch (code) {
      case 'call': return 'phone';
      case 'email': return 'email';
      case 'note': return 'note';
      case 'system': return 'settings';
      default: return 'event_note';
    }
  }

  async toggleTask(task: TaskItem): Promise<void> {
    try {
      await this.api.updateTaskStatus(this.data.client.clientId, task.taskId, !task.isDone);
      task.isDone = !task.isDone;
    } catch {}
  }
}
