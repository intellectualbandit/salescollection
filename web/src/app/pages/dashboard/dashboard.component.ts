import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TrackerApiService } from '../../core/services/tracker-api.service';
import {
  DashboardSummary, DashboardBreakdown, ProjectItem
} from '../../core/models/tracker.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatSelectModule, MatCardModule,
    MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  loading = signal(true);
  projects = signal<ProjectItem[]>([]);
  selectedProjectId = signal<number | undefined>(undefined);
  summary = signal<DashboardSummary | null>(null);
  breakdown = signal<DashboardBreakdown | null>(null);

  constructor(private api: TrackerApiService) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadData();
  }

  async loadProjects(): Promise<void> {
    try {
      const p = await this.api.getProjects();
      this.projects.set(p);
    } catch {}
  }

  async loadData(): Promise<void> {
    this.loading.set(true);
    try {
      const [s, b] = await Promise.all([
        this.api.getSummary(this.selectedProjectId()),
        this.api.getBreakdown(6, this.selectedProjectId()),
      ]);
      this.summary.set(s);
      this.breakdown.set(b);
    } catch {
      this.summary.set(null);
      this.breakdown.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  onProjectChange(id: number | undefined): void {
    this.selectedProjectId.set(id);
    this.loadData();
  }

  getHealthLabel(s: DashboardSummary): string {
    const rate = s.completionRatePercent;
    if (rate >= 80) return 'Excellent';
    if (rate >= 60) return 'Good';
    if (rate >= 40) return 'Fair';
    return 'Needs Attention';
  }

  getHealthColor(s: DashboardSummary): string {
    const rate = s.completionRatePercent;
    if (rate >= 80) return '#2E7D32';
    if (rate >= 60) return '#0288D1';
    if (rate >= 40) return '#ED6C02';
    return '#D32F2F';
  }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val);
  }
}
