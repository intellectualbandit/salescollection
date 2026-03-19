import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TrackerApiService } from '../../../core/services/tracker-api.service';
import {
  ClientListItem, ProjectItem, StageItem, DelayReasonItem,
  FinancingTypeItem, UpsertClientRequest, ProjectUnitItem
} from '../../../core/models/tracker.model';

@Component({
  selector: 'app-client-edit-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule,
    MatCheckboxModule, MatProgressSpinnerModule, MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.client ? 'Edit Client' : 'New Client' }}</h2>
    <mat-dialog-content>
      <div class="form-grid">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Client Name</mat-label>
          <input matInput [(ngModel)]="form.clientName" required>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Project</mat-label>
          <mat-select [(ngModel)]="selectedProjectId" (selectionChange)="onProjectChange()">
            @for (p of data.projects; track p.projectId) {
              <mat-option [value]="p.projectId">{{ p.projectName }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Unit</mat-label>
          <mat-select [(ngModel)]="form.unitId">
            @for (u of units(); track u.unitId) {
              <mat-option [value]="u.unitId">{{ u.unitLabel }} ({{ u.unitType }})</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Contact Number</mat-label>
          <input matInput [(ngModel)]="form.contactNumber">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Broker Name</mat-label>
          <input matInput [(ngModel)]="form.brokerName">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Total Contract Price</mat-label>
          <input matInput type="number" [(ngModel)]="form.totalContractPrice">
          <span matPrefix>&#8369;&nbsp;</span>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Financing Type</mat-label>
          <mat-select [(ngModel)]="form.financingTypeId">
            @for (ft of data.financingTypes; track ft.financingTypeId) {
              <mat-option [value]="ft.financingTypeId">{{ ft.typeName }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Pipeline Stage</mat-label>
          <mat-select [(ngModel)]="form.stageId" required>
            @for (s of data.stages; track s.stageId) {
              <mat-option [value]="s.stageId">{{ s.stageName }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Stage Date</mat-label>
          <input matInput type="date" [(ngModel)]="form.stageDate">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Target Date</mat-label>
          <input matInput type="date" [(ngModel)]="form.targetDate">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Primary Delay Reason</mat-label>
          <mat-select [(ngModel)]="form.primaryDelayReasonId">
            <mat-option [value]="null">None</mat-option>
            @for (dr of data.delayReasons; track dr.delayReasonId) {
              <mat-option [value]="dr.delayReasonId">{{ dr.reasonName }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Secondary Delay Reason</mat-label>
          <mat-select [(ngModel)]="form.secondaryDelayReasonId">
            <mat-option [value]="null">None</mat-option>
            @for (dr of data.delayReasons; track dr.delayReasonId) {
              <mat-option [value]="dr.delayReasonId">{{ dr.reasonName }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Next Action</mat-label>
          <input matInput [(ngModel)]="form.nextAction">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Follow-up Date</mat-label>
          <input matInput type="date" [(ngModel)]="form.followUpDate">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Notes</mat-label>
          <textarea matInput [(ngModel)]="form.notes" rows="3"></textarea>
        </mat-form-field>

        <mat-checkbox [(ngModel)]="form.isCancellation">Mark as Cancellation</mat-checkbox>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="saving()">
        @if (saving()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          {{ data.client ? 'Update' : 'Create' }}
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
      padding: 8px 0;
    }
    .full-width { grid-column: 1 / -1; }
    mat-dialog-content { max-height: 65vh; }
    @media (max-width: 600px) {
      .form-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class ClientEditDialogComponent implements OnInit {
  saving = signal(false);
  units = signal<ProjectUnitItem[]>([]);
  selectedProjectId: number | null = null;

  form: UpsertClientRequest = {
    clientName: '',
    unitId: null,
    contactNumber: '',
    brokerName: '',
    totalContractPrice: 0,
    financingTypeId: null,
    stageId: 0,
    stageDate: new Date().toISOString().split('T')[0],
    targetDate: new Date().toISOString().split('T')[0],
    resolvedDate: null,
    primaryDelayReasonId: null,
    secondaryDelayReasonId: null,
    nextAction: '',
    followUpDate: null,
    notes: '',
    isCancellation: false,
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      client: ClientListItem | null;
      projects: ProjectItem[];
      stages: StageItem[];
      delayReasons: DelayReasonItem[];
      financingTypes: FinancingTypeItem[];
    },
    private ref: MatDialogRef<ClientEditDialogComponent>,
    private api: TrackerApiService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    if (this.data.client) {
      const c = this.data.client;
      this.selectedProjectId = c.projectId;
      this.form = {
        clientName: c.clientName,
        unitId: null,
        contactNumber: c.contactNumber,
        brokerName: c.brokerName,
        totalContractPrice: c.totalContractPrice,
        financingTypeId: null,
        stageId: c.stageId,
        stageDate: c.stageDate,
        targetDate: c.targetDate,
        resolvedDate: c.resolvedDate,
        primaryDelayReasonId: null,
        secondaryDelayReasonId: null,
        nextAction: c.nextAction,
        followUpDate: c.followUpDate,
        notes: c.notes,
        isCancellation: c.isCancellation,
      };
      this.onProjectChange();
    }
  }

  async onProjectChange(): Promise<void> {
    if (!this.selectedProjectId) {
      this.units.set([]);
      return;
    }
    try {
      const u = await this.api.getProjectUnits(this.selectedProjectId);
      this.units.set(u);
    } catch {
      this.units.set([]);
    }
  }

  async save(): Promise<void> {
    if (!this.form.clientName || !this.form.stageId) {
      this.snackBar.open('Client name and stage are required', 'OK', { duration: 3000 });
      return;
    }
    this.saving.set(true);
    try {
      if (this.data.client) {
        await this.api.updateClient(this.data.client.clientId, this.form);
      } else {
        await this.api.createClient(this.form);
      }
      this.snackBar.open(this.data.client ? 'Client updated' : 'Client created', 'OK', { duration: 3000 });
      this.ref.close(true);
    } catch {
      this.snackBar.open('Failed to save client', 'OK', { duration: 3000 });
    } finally {
      this.saving.set(false);
    }
  }
}
