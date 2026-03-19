import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TrackerApiService } from '../../core/services/tracker-api.service';
import {
  ClientListItem, ClientFilter, AgingStatus, ProjectItem,
  StageItem, DelayReasonItem, FinancingTypeItem
} from '../../core/models/tracker.model';
import { ClientEditDialogComponent } from './components/client-edit-dialog.component';
import { ClientDetailDialogComponent } from './components/client-detail-dialog.component';

@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatChipsModule,
    MatTableModule, MatMenuModule, MatDialogModule, MatProgressSpinnerModule,
    MatTooltipModule, MatSnackBarModule,
  ],
  templateUrl: './tracker.component.html',
  styleUrl: './tracker.component.scss',
})
export class TrackerComponent implements OnInit {
  loading = signal(true);
  clients = signal<ClientListItem[]>([]);
  projects = signal<ProjectItem[]>([]);
  stages = signal<StageItem[]>([]);
  delayReasons = signal<DelayReasonItem[]>([]);
  financingTypes = signal<FinancingTypeItem[]>([]);

  filter = signal<ClientFilter>('all');
  search = signal('');
  sortField = signal('name');
  sortDir = signal<'asc' | 'desc'>('asc');
  selectedProjectId = signal<number | undefined>(undefined);

  filters: { label: string; value: ClientFilter; icon: string; color: string }[] = [
    { label: 'All', value: 'all', icon: 'list', color: '#666' },
    { label: 'Critical', value: 'critical', icon: 'error', color: '#D32F2F' },
    { label: 'Warning', value: 'warning', icon: 'warning', color: '#ED6C02' },
    { label: 'Watch', value: 'watch', icon: 'visibility', color: '#F9A825' },
    { label: 'On Track', value: 'ok', icon: 'check_circle', color: '#2E7D32' },
    { label: 'Resolved', value: 'resolved', icon: 'done_all', color: '#0288D1' },
    { label: 'Cancelled', value: 'cancellation', icon: 'cancel', color: '#9E9E9E' },
  ];

  displayedColumns = ['clientName', 'project', 'unit', 'stage', 'aging', 'tcp', 'financing', 'broker', 'actions'];

  private searchTimeout: any;

  constructor(
    private api: TrackerApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadMasterData();
    this.loadClients();
  }

  async loadMasterData(): Promise<void> {
    try {
      const [projects, stages, delayReasons, financingTypes] = await Promise.all([
        this.api.getProjects(),
        this.api.getStages(),
        this.api.getDelayReasons(),
        this.api.getFinancingTypes(),
      ]);
      this.projects.set(projects);
      this.stages.set(stages);
      this.delayReasons.set(delayReasons);
      this.financingTypes.set(financingTypes);
    } catch {}
  }

  async loadClients(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this.api.getClients(
        this.filter(), this.search(), this.sortField(), this.sortDir(), this.selectedProjectId()
      );
      this.clients.set(data);
    } catch {
      this.clients.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  onFilterChange(f: ClientFilter): void {
    this.filter.set(f);
    this.loadClients();
  }

  onSearchChange(value: string): void {
    this.search.set(value);
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.loadClients(), 300);
  }

  onSortChange(field: string): void {
    if (this.sortField() === field) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDir.set('asc');
    }
    this.loadClients();
  }

  onProjectChange(id: number | undefined): void {
    this.selectedProjectId.set(id);
    this.loadClients();
  }

  getAgingStatus(days: number): AgingStatus {
    if (days >= 30) return 'critical';
    if (days >= 14) return 'warning';
    if (days >= 7) return 'watch';
    return 'ok';
  }

  getAgingColor(days: number): string {
    const s = this.getAgingStatus(days);
    switch (s) {
      case 'critical': return '#D32F2F';
      case 'warning': return '#ED6C02';
      case 'watch': return '#F9A825';
      case 'ok': return '#2E7D32';
    }
  }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val);
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(ClientEditDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        client: null,
        projects: this.projects(),
        stages: this.stages(),
        delayReasons: this.delayReasons(),
        financingTypes: this.financingTypes(),
      },
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.loadClients();
    });
  }

  openEditDialog(client: ClientListItem): void {
    const ref = this.dialog.open(ClientEditDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        client,
        projects: this.projects(),
        stages: this.stages(),
        delayReasons: this.delayReasons(),
        financingTypes: this.financingTypes(),
      },
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.loadClients();
    });
  }

  openDetailDialog(client: ClientListItem): void {
    this.dialog.open(ClientDetailDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { client },
    });
  }

  async deleteClient(client: ClientListItem): Promise<void> {
    if (!confirm(`Delete client "${client.clientName}"?`)) return;
    try {
      await this.api.deleteClient(client.clientId);
      this.snackBar.open('Client deleted', 'OK', { duration: 3000 });
      this.loadClients();
    } catch {
      this.snackBar.open('Failed to delete client', 'OK', { duration: 3000 });
    }
  }

  async resolveClient(client: ClientListItem): Promise<void> {
    const notes = prompt('Resolution notes:');
    if (notes === null) return;
    try {
      await this.api.resolveClient(client.clientId, {
        resolvedBy: 'Manual',
        resolutionNotes: notes,
        resolvedDate: new Date().toISOString().split('T')[0],
      });
      this.snackBar.open('Client resolved', 'OK', { duration: 3000 });
      this.loadClients();
    } catch {
      this.snackBar.open('Failed to resolve client', 'OK', { duration: 3000 });
    }
  }
}
