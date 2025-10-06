import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ActivityEntity = 'User' | 'Organization';
export type ActivityAction = 'Created' | 'Updated' | 'Deleted' | 'Role Updated';

export interface ActivityItem {
  id: string;
  entity: ActivityEntity;
  action: ActivityAction;
  title: string;
  description?: string;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly maxItems = 3;
  private readonly activitiesSubject = new BehaviorSubject<ActivityItem[]>([]);
  activities$ = this.activitiesSubject.asObservable();

  addActivity(item: Omit<ActivityItem, 'id' | 'timestamp'> & Partial<Pick<ActivityItem, 'timestamp'>>): void {
    const activity: ActivityItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
      timestamp: item.timestamp ?? new Date(),
      entity: item.entity,
      action: item.action,
      title: item.title,
      description: item.description
    };

    const current = this.activitiesSubject.getValue();
    const next = [activity, ...current].slice(0, this.maxItems);
    this.activitiesSubject.next(next);
  }

  clear(): void {
    this.activitiesSubject.next([]);
  }
}


