// Storage interface for browser application
// Currently using in-memory storage for tabs and history

export interface IStorage {
  // Future: Add methods for persisting tabs, bookmarks, history, etc.
}

export class MemStorage implements IStorage {
  constructor() {
    // Initialize storage
  }
}

export const storage = new MemStorage();
