import { generateUUID } from '../utils/validation.js';

export class Category {
  constructor(data = {}) {
    this.id = data.id || generateUUID();
    this.name = data.name || '';
    this.color = data.color || this.generateRandomColor();
    this.icon = data.icon || '📁';
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  generateRandomColor() {
    const colors = [
      '#4F46E5', // Indigo
      '#10B981', // Green
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#3B82F6', // Blue
      '#8B5CF6', // Purple
      '#EC4899', // Pink
      '#14B8A6', // Teal
      '#F97316', // Orange
      '#6366F1', // Violet
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  validate() {
    const errors = [];

    if (!this.name || this.name.trim() === '') {
      errors.push('Category name is required');
    }

    if (!this.color || !/^#[0-9A-F]{6}$/i.test(this.color)) {
      errors.push('Valid color hex code is required');
    }

    return errors;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      icon: this.icon,
      createdAt: this.createdAt
    };
  }

  static fromJSON(data) {
    return new Category(data);
  }

  static getDefaultCategories() {
    return [
      { name: 'Streaming', icon: '📺', color: '#EF4444' },
      { name: 'Software', icon: '💻', color: '#3B82F6' },
      { name: 'Utilities', icon: '⚡', color: '#F59E0B' },
      { name: 'Entertainment', icon: '🎮', color: '#8B5CF6' },
      { name: 'Fitness', icon: '💪', color: '#10B981' },
      { name: 'Music', icon: '🎵', color: '#EC4899' },
      { name: 'News', icon: '📰', color: '#6B7280' },
      { name: 'Cloud Storage', icon: '☁️', color: '#14B8A6' },
      { name: 'Food & Delivery', icon: '🍕', color: '#F97316' },
      { name: 'Other', icon: '📁', color: '#4F46E5' }
    ].map(cat => new Category(cat));
  }
}
