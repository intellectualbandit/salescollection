import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TrackerApiService } from '../../core/services/tracker-api.service';
import { DashboardSummary, DashboardBreakdown, ProjectItem } from '../../core/models/tracker.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatSelectModule, MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class ReportsComponent implements OnInit {
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
      this.projects.set(await this.api.getProjects());
    } catch {}
  }

  async loadData(): Promise<void> {
    this.loading.set(true);
    try {
      const [s, b] = await Promise.all([
        this.api.getSummary(this.selectedProjectId()),
        this.api.getBreakdown(10, this.selectedProjectId()),
      ]);
      this.summary.set(s);
      this.breakdown.set(b);
    } catch {
      this.summary.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  onProjectChange(id: number | undefined): void {
    this.selectedProjectId.set(id);
    this.loadData();
  }

  formatCurrency(val: number): string {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val);
  }
}
